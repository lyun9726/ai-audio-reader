import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Download book in bilingual format (original + translation)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bookId } = await params

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get book info
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_user_id', user.id)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Get all paragraphs with translations
    const { data: paragraphs, error: parasError } = await supabase
      .from('book_paragraphs')
      .select('para_idx, text_original, text_translated')
      .eq('book_id', bookId)
      .order('para_idx', { ascending: true })

    if (parasError || !paragraphs) {
      return NextResponse.json({ error: 'Failed to load paragraphs' }, { status: 500 })
    }

    // Generate bilingual text
    let content = `${book.title}\n`
    if (book.author) {
      content += `作者: ${book.author}\n`
    }
    content += `\n${'='.repeat(60)}\n\n`

    for (const para of paragraphs) {
      // Original text
      content += `${para.text_original}\n\n`

      // Translation (if available)
      if (para.text_translated) {
        content += `【译文】${para.text_translated}\n\n`
      } else {
        content += `【译文】（未翻译）\n\n`
      }

      content += `${'-'.repeat(60)}\n\n`
    }

    // Return as downloadable text file
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="bilingual-${book.title}.txt"`,
      },
    })
  } catch (error: any) {
    console.error('[Download Bilingual] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate bilingual file' },
      { status: 500 }
    )
  }
}
