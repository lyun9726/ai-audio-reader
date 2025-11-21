import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { parseBook, isFormatSupported } from '@/lib/parsers'

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

    // Validate file type using new parser system
    if (!isFormatSupported(file)) {
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

    // Parse book using new parser system
    console.log('[Upload] Parsing book:', file.name)
    const parsedBook = await parseBook(file)

    console.log('[Upload] Parsed successfully:', {
      format: parsedBook.format,
      paragraphs: parsedBook.paragraphs.length,
      metadata: parsedBook.metadata,
    })

    // Determine max chapter number (for PDF it's 1, for EPUB varies)
    const chapterNumbers = parsedBook.paragraphs
      .map(p => {
        // For EPUB, we don't have chapter numbers, so count unique chapter titles
        if (parsedBook.format === 'epub') return 1
        // For PDF, use page number or 1
        return p.page || 1
      })
    const maxChapter = chapterNumbers.length > 0 ? Math.max(...chapterNumbers) : 1

    // Create book record with new fields
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        owner_user_id: user.id,
        title: title,
        author: author || parsedBook.metadata.author || null,
        description: description || null,
        original_lang: sourceLang,
        target_lang: targetLang,
        status: 'processing',
        format: parsedBook.format,
        file_url: parsedBook.fileUrl,
        page_count: parsedBook.metadata.pageCount || parsedBook.metadata.totalPages,
        publisher: parsedBook.metadata.publisher,
        language: parsedBook.metadata.language,
        isbn: parsedBook.metadata.isbn,
        total_chapters: maxChapter,
        total_paragraphs: parsedBook.paragraphs.length,
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

    // Insert paragraphs with format-specific fields
    const paragraphsToInsert = parsedBook.paragraphs.map(p => ({
      book_id: book.id,
      chapter: p.page || 1, // Use page for PDF, default 1 for EPUB
      para_idx: p.index,
      text_original: p.text,
      tokens: Math.ceil(p.text.length / 4), // Rough estimate
      // PDF-specific fields
      page: p.page,
      bbox: p.bbox ? JSON.stringify(p.bbox) : null,
      // EPUB-specific fields
      chapter_title: p.chapter,
      href: p.href,
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
        totalParagraphs: parsedBook.paragraphs.length,
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
