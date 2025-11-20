import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { processBookFile } from '@/lib/services/textExtractor'

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

    // Validate file type
    const fileName = file.name.toLowerCase()
    const fileType = fileName.endsWith('.pdf') ? 'pdf' : fileName.endsWith('.epub') ? 'epub' : null

    if (!fileType) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and EPUB are supported.' },
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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text and split into paragraphs
    const { content, paragraphs } = await processBookFile(buffer, fileType)

    // Create book record
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        owner_user_id: user.id,
        title: title,
        author: author || content.author || null,
        description: description || null,
        original_lang: sourceLang,
        target_lang: targetLang,
        status: 'processing',
        total_chapters: Math.max(...paragraphs.map(p => p.chapter), 1),
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
    const paragraphsToInsert = paragraphs.map(p => ({
      book_id: book.id,
      chapter: p.chapter,
      para_idx: p.paraIdx,
      text_original: p.text,
      tokens: Math.ceil(p.text.length / 4), // Rough estimate
    }))

    // Insert in batches to avoid timeout
    const BATCH_SIZE = 100
    for (let i = 0; i < paragraphsToInsert.length; i += BATCH_SIZE) {
      const batch = paragraphsToInsert.slice(i, i + BATCH_SIZE)
      const { error: paraError } = await supabase
        .from('book_paragraphs')
        .insert(batch)

      if (paraError) {
        console.error('Error inserting paragraphs:', paraError)
        // Mark book as error
        await supabase
          .from('books')
          .update({ status: 'error' })
          .eq('id', book.id)

        return NextResponse.json(
          { error: 'Failed to save book paragraphs' },
          { status: 500 }
        )
      }
    }

    // Update book status to ready for translation
    await supabase
      .from('books')
      .update({ status: 'ready' })
      .eq('id', book.id)

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
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

// Note: bodyParser config is handled by Next.js App Router automatically
