import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Verify book ownership
    const { data: book } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .eq('owner_user_id', user.id)
      .single()

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const { data: paragraphs, error } = await supabase
      .from('book_paragraphs')
      .select('*')
      .eq('book_id', bookId)
      .order('para_idx', { ascending: true })

    if (error) {
      console.error('Error fetching paragraphs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch paragraphs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ paragraphs })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
