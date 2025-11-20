import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateSummary } from '@/lib/services/summarizer'

export async function POST(
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
    const { scope, fromPara, toPara } = await request.json()

    // Verify book ownership
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_user_id', user.id)
      .single()

    if (bookError || !book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Fetch reading progress to determine "today's" paragraphs
    let query = supabase
      .from('book_paragraphs')
      .select('text_translated')
      .eq('book_id', bookId)
      .not('text_translated', 'is', null)

    if (scope === 'today' || scope === 'range') {
      // Get paragraphs in range
      const from = fromPara || 0
      const to = toPara || from + 20 // Default to 20 paragraphs
      query = query.gte('para_idx', from).lte('para_idx', to)
    }

    query = query.order('para_idx', { ascending: true })

    const { data: paragraphs, error: parasError } = await query

    if (parasError || !paragraphs || paragraphs.length === 0) {
      return NextResponse.json(
        { error: 'No paragraphs found to summarize' },
        { status: 400 }
      )
    }

    // Generate summary
    const texts = paragraphs
      .map(p => p.text_translated)
      .filter(t => t !== null) as string[]

    const summaryResult = await generateSummary(texts, scope)

    // Save summary to database
    const { data: savedSummary, error: saveError } = await supabase
      .from('summaries')
      .insert({
        user_id: user.id,
        book_id: bookId,
        scope: scope || 'today',
        content: JSON.stringify(summaryResult),
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving summary:', saveError)
    }

    return NextResponse.json({
      success: true,
      summary: summaryResult,
      summaryId: savedSummary?.id,
    })
  } catch (error: any) {
    console.error('Summary error:', error)
    return NextResponse.json(
      { error: error.message || 'Summary generation failed' },
      { status: 500 }
    )
  }
}

// Get all summaries for a book
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

    const { data: summaries, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching summaries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch summaries' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summaries })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
