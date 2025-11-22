import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check book and paragraphs status
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

    // Count paragraphs
    const { count: paraCount, error: countError } = await supabase
      .from('book_paragraphs')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)

    // Get first 5 paragraphs
    const { data: sampleParas, error: sampleError } = await supabase
      .from('book_paragraphs')
      .select('para_idx, text_original, text_translated')
      .eq('book_id', bookId)
      .order('para_idx', { ascending: true })
      .limit(5)

    return NextResponse.json({
      book: {
        id: book.id,
        title: book.title,
        format: book.format,
        total_paragraphs: book.total_paragraphs,
        status: book.status,
        created_at: book.created_at,
      },
      paragraphs: {
        count: paraCount || 0,
        samples: sampleParas || [],
      },
      diagnosis: {
        has_paragraphs: (paraCount || 0) > 0,
        paragraph_mismatch: book.total_paragraphs !== (paraCount || 0),
        needs_reupload: (paraCount || 0) === 0,
      }
    })
  } catch (error: any) {
    console.error('[Debug] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get debug info' },
      { status: 500 }
    )
  }
}
