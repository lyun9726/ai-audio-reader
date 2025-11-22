import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { detectFormat } from '@/lib/parsers'
import { processBookFile } from '@/lib/services/textExtractor'

// Route segment config for large file uploads
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Use regular client for auth check
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const author = formData.get('author') as string || null
    const description = formData.get('description') as string || null
    const sourceLang = formData.get('sourceLang') as string || 'en'
    const targetLang = formData.get('targetLang') as string || 'zh'
    const extractedText = formData.get('extractedText') as string || null // Client-side extracted text

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Detect format
    const format = detectFormat(file)
    if (!format) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, EPUB and TXT are supported.' },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    console.log('[Upload] Processing file:', file.name, 'Format:', format)

    // Create service role client for storage upload (anon key doesn't have upload permission)
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Sanitize filename: remove special characters and spaces
    const sanitizedFileName = file.name
      .replace(/[^\w\s.-]/g, '') // Remove special chars except dots, dashes, spaces
      .replace(/\s+/g, '_')       // Replace spaces with underscores
      .substring(0, 100)          // Limit length to 100 chars

    // Upload file to Supabase Storage first
    const fileName = `${user.id}/${Date.now()}_${sanitizedFileName}`
    const arrayBuffer = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('books')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('books')
      .getPublicUrl(fileName)

    console.log('[Upload] File uploaded to:', publicUrl)

    // Extract text and paragraphs for translation/TTS features
    let totalParagraphs = 0
    let extractedAuthor = author

    if (format === 'pdf' || format === 'epub') {
      try {
        // Use client-extracted text if available (for PDF)
        let fullText = extractedText

        if (!fullText) {
          // Fall back to server-side extraction for EPUB
          console.log('[Upload] Extracting text from', format.toUpperCase(), '...')
          const buffer = Buffer.from(arrayBuffer)
          const { content, paragraphs: extractedParas } = await processBookFile(buffer, format)
          fullText = content.text
          extractedAuthor = extractedAuthor || content.author
        } else {
          console.log('[Upload] Using client-extracted text, length:', fullText.length)
        }

        if (!fullText || fullText.trim().length === 0) {
          throw new Error('No text extracted from file')
        }

        // Split into paragraphs
        const { splitIntoParagraphs } = await import('@/lib/services/textExtractor')
        const paragraphs = splitIntoParagraphs(fullText)

        totalParagraphs = paragraphs.length
        console.log('[Upload] ✓ Split into', totalParagraphs, 'paragraphs')

        // Create book record first
        const { data: book, error: bookError } = await supabase
          .from('books')
          .insert({
            owner_user_id: user.id,
            title: title,
            author: extractedAuthor,
            description: description,
            original_lang: sourceLang,
            target_lang: targetLang,
            status: 'ready',
            format: format,
            file_url: publicUrl,
            s3_original_url: publicUrl,
            total_chapters: 1,
            total_paragraphs: totalParagraphs,
          })
          .select()
          .single()

        if (bookError) {
          console.error('Error creating book:', bookError)
          return NextResponse.json(
            { error: 'Failed to create book record' },
            { status: 500 }
          )
        }

        // Insert paragraphs into database
        console.log('[Upload] Saving paragraphs to database...')
        const paragraphRecords = paragraphs.map(p => ({
          book_id: book.id,
          chapter: p.chapter,
          para_idx: p.paraIdx,
          text_original: p.text,
        }))

        // Insert in batches to avoid payload size issues
        const BATCH_SIZE = 100
        for (let i = 0; i < paragraphRecords.length; i += BATCH_SIZE) {
          const batch = paragraphRecords.slice(i, i + BATCH_SIZE)
          const { error: parasError } = await supabase
            .from('book_paragraphs')
            .insert(batch)

          if (parasError) {
            console.error('[Upload] Error inserting paragraphs:', parasError)
            // Continue anyway - some paragraphs are better than none
          }
        }

        console.log('[Upload] ✓ Book created successfully:', book.id)
        console.log('[Upload] ✓ Original file preserved at:', publicUrl)
        console.log('[Upload] ✓ Saved', totalParagraphs, 'paragraphs to database')

        return NextResponse.json({
          success: true,
          book: {
            id: book.id,
            title: book.title,
            format: book.format,
            fileUrl: publicUrl,
            totalParagraphs: totalParagraphs,
          },
        })
      } catch (extractError: any) {
        console.error('[Upload] Text extraction failed:', extractError)
        console.error('[Upload] Error stack:', extractError.stack)

        // For PDF/EPUB, text extraction is critical - return error instead of creating empty book
        return NextResponse.json(
          {
            error: 'Text extraction failed: ' + extractError.message,
            details: 'Unable to extract text from this PDF/EPUB file. The file may be scanned images or password-protected.',
          },
          { status: 500 }
        )
      }
    }

    // Fallback: Create book without paragraphs (only for TXT format)
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        owner_user_id: user.id,
        title: title,
        author: extractedAuthor,
        description: description,
        original_lang: sourceLang,
        target_lang: targetLang,
        status: 'ready',
        format: format,
        file_url: publicUrl,
        s3_original_url: publicUrl,
        total_chapters: 1,
        total_paragraphs: totalParagraphs,
      })
      .select()
      .single()

    if (bookError) {
      console.error('Error creating book:', bookError)
      return NextResponse.json(
        { error: 'Failed to create book record' },
        { status: 500 }
      )
    }

    console.log('[Upload] ✓ Book created successfully:', book.id)
    console.log('[Upload] ✓ Original file preserved at:', publicUrl)

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        format: book.format,
        fileUrl: publicUrl,
      },
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during upload' },
      { status: 500 }
    )
  }
}
