import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { detectFormat } from '@/lib/parsers'

// Simple text extraction for server-side (no DOM dependencies)
async function extractTextSimple(file: File, format: string): Promise<string[]> {
  if (format === 'txt') {
    const text = await file.text()
    return text.split(/\n\n+/).filter(p => p.trim().length > 20)
  }

  // For PDF and EPUB, we'll extract text on client-side later
  // For now, create placeholder paragraphs
  return [`File uploaded: ${file.name}. Content will be processed when you open the reader.`]
}

export async function POST(request: Request) {
  try {
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

    // Upload file to Supabase Storage first
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const arrayBuffer = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabase.storage
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
    const { data: { publicUrl } } = supabase.storage
      .from('books')
      .getPublicUrl(fileName)

    console.log('[Upload] File uploaded to:', publicUrl)

    // Extract simple text for initial processing
    const paragraphs = await extractTextSimple(file, format)

    // Create book record
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        owner_user_id: user.id,
        title: title,
        author: author,
        description: description,
        original_lang: sourceLang,
        target_lang: targetLang,
        status: 'ready', // Changed from 'processing' to 'ready'
        format: format,
        file_url: publicUrl,
        s3_original_url: publicUrl,
        total_chapters: 1,
        total_paragraphs: paragraphs.length,
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

    // Insert paragraphs
    const paragraphsToInsert = paragraphs.map((text, index) => ({
      book_id: book.id,
      chapter: 1,
      para_idx: index,
      text_original: text,
      tokens: Math.ceil(text.length / 4),
    }))

    const { error: paraError } = await supabase
      .from('book_paragraphs')
      .insert(paragraphsToInsert)

    if (paraError) {
      console.error('Error inserting paragraphs:', paraError)
      // Don't fail completely, just log the error
    }

    console.log('[Upload] ✓ Book created successfully:', book.id)

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        format: book.format,
        totalParagraphs: paragraphs.length,
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
