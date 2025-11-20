import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { translateBatch } from '@/lib/services/translator'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bookId } = await params

    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Update book status
    await supabase
      .from('books')
      .update({ status: 'translating' })
      .eq('id', bookId)

    // Fetch paragraphs that need translation
    console.log('[Translate API] Fetching paragraphs for book:', bookId)
    const { data: paragraphs, error: parasError } = await supabase
      .from('book_paragraphs')
      .select('id, text_original, para_idx')
      .eq('book_id', bookId)
      .is('text_translated', null)
      .order('para_idx', { ascending: true })

    console.log('[Translate API] Found paragraphs:', paragraphs?.length || 0)

    if (parasError) {
      console.error('[Translate API] Error fetching paragraphs:', parasError)
      return NextResponse.json(
        { error: 'Failed to fetch paragraphs' },
        { status: 500 }
      )
    }

    if (!paragraphs || paragraphs.length === 0) {
      // Check if already translated
      const { data: allParas } = await supabase
        .from('book_paragraphs')
        .select('id, text_translated')
        .eq('book_id', bookId)

      console.log('[Translate API] Total paragraphs in DB:', allParas?.length || 0)
      console.log('[Translate API] Translated paragraphs:', allParas?.filter(p => p.text_translated).length || 0)

      await supabase
        .from('books')
        .update({ status: 'ready' })
        .eq('id', bookId)

      return NextResponse.json({
        success: true,
        message: 'Book already translated',
        totalParagraphs: 0,
      })
    }

    // Translate in batches
    console.log('[Translate API] Starting translation of', paragraphs.length, 'paragraphs')
    const texts = paragraphs.map(p => p.text_original)
    const translations = await translateBatch(
      texts,
      book.original_lang,
      book.target_lang
    )

    console.log('[Translate API] Translation complete, received', translations.length, 'results')

    // Update paragraphs with translations
    const BATCH_SIZE = 50
    let updatedCount = 0
    for (let i = 0; i < paragraphs.length; i += BATCH_SIZE) {
      const batch = paragraphs.slice(i, i + BATCH_SIZE)
      const updates = batch.map((para, idx) => ({
        id: para.id,
        text_translated: translations[i + idx].text,
        tokens: translations[i + idx].tokens,
      }))

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('book_paragraphs')
          .update({
            text_translated: update.text_translated,
            tokens: update.tokens,
          })
          .eq('id', update.id)

        if (updateError) {
          console.error('[Translate API] Failed to update paragraph:', update.id, updateError)
        } else {
          updatedCount++
        }
      }
    }

    console.log('[Translate API] Successfully updated', updatedCount, 'paragraphs in database')

    // Update book status to ready
    await supabase
      .from('books')
      .update({ status: 'ready' })
      .eq('id', bookId)

    return NextResponse.json({
      success: true,
      totalParagraphs: paragraphs.length,
      totalTokens: translations.reduce((sum, t) => sum + t.tokens, 0),
    })
  } catch (error: any) {
    console.error('Translation error:', error)

    // Update book status to error - bookId is already available in scope
    const supabase = await createClient()
    const { bookId: errorBookId } = await params
    await supabase
      .from('books')
      .update({ status: 'error' })
      .eq('id', errorBookId)

    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}
