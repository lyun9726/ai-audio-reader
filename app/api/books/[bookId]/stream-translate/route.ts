import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { translateText } from '@/lib/services/translator'

/**
 * Stream translation API - translates one paragraph at a time
 * This allows for real-time user experience
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params

  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paraIdx } = await request.json()

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

    // Get the specific paragraph
    console.log(`[Stream Translate] Fetching paragraph ${paraIdx} for book ${bookId}`)
    const { data: paragraph, error: paraError } = await supabase
      .from('book_paragraphs')
      .select('id, text_original, text_translated, para_idx')
      .eq('book_id', bookId)
      .eq('para_idx', paraIdx)
      .single()

    if (paraError) {
      console.error('[Stream Translate] Paragraph fetch error:', paraError)
      // Check if any paragraphs exist for this book
      const { count } = await supabase
        .from('book_paragraphs')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', bookId)

      console.error(`[Stream Translate] Total paragraphs for book ${bookId}:`, count)
      return NextResponse.json(
        { error: `Paragraph not found. Book has ${count || 0} paragraphs. Please re-upload the book.` },
        { status: 404 }
      )
    }

    if (!paragraph) {
      console.error('[Stream Translate] Paragraph is null')
      return NextResponse.json(
        { error: 'Paragraph not found' },
        { status: 404 }
      )
    }

    console.log(`[Stream Translate] Found paragraph ${paraIdx}, length: ${paragraph.text_original?.length || 0}`)

    // If already translated, return it
    if (paragraph.text_translated) {
      return NextResponse.json({
        success: true,
        paraIdx: paragraph.para_idx,
        translation: paragraph.text_translated,
        cached: true,
      })
    }

    // Translate this paragraph
    console.log(`[Stream Translate] Translating paragraph ${paraIdx}`)
    const result = await translateText(
      paragraph.text_original,
      book.original_lang,
      book.target_lang
    )

    // Save translation
    const { error: updateError } = await supabase
      .from('book_paragraphs')
      .update({
        text_translated: result.translatedText,
        tokens: result.tokensUsed,
      })
      .eq('id', paragraph.id)

    if (updateError) {
      console.error('[Stream Translate] Failed to save:', updateError)
    }

    return NextResponse.json({
      success: true,
      paraIdx: paragraph.para_idx,
      translation: result.translatedText,
      tokens: result.tokensUsed,
      cached: false,
    })
  } catch (error: any) {
    console.error('[Stream Translate] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}
