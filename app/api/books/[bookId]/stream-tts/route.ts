import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateParagraphAudio, TTSVoice } from '@/lib/services/tts'

/**
 * Stream TTS API - generates audio for one paragraph at a time
 * This allows for real-time playback while generating
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

    const { paraIdx, voice, speed } = await request.json()

    // Verify book ownership
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .eq('owner_user_id', user.id)
      .single()

    if (bookError || !book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Get the paragraph with translation
    const { data: paragraph, error: paraError } = await supabase
      .from('book_paragraphs')
      .select('id, text_translated, para_idx')
      .eq('book_id', bookId)
      .eq('para_idx', paraIdx)
      .single()

    if (paraError || !paragraph || !paragraph.text_translated) {
      return NextResponse.json(
        { error: 'Translated paragraph not found' },
        { status: 404 }
      )
    }

    // Check if audio already exists
    const { data: existingAudio } = await supabase
      .from('book_audio_manifest')
      .select('audio_url, duration')
      .eq('book_id', bookId)
      .eq('para_idx', paraIdx)
      .single()

    if (existingAudio) {
      return NextResponse.json({
        success: true,
        paraIdx: paragraph.para_idx,
        audioUrl: existingAudio.audio_url,
        duration: existingAudio.duration,
        cached: true,
      })
    }

    // Generate audio
    console.log(`[Stream TTS] Generating audio for paragraph ${paraIdx}`)
    const result = await generateParagraphAudio(
      bookId,
      paragraph.para_idx,
      paragraph.text_translated,
      (voice as TTSVoice) || 'nova',
      speed || 1.0
    )

    // Save to manifest
    const { error: saveError } = await supabase
      .from('book_audio_manifest')
      .insert({
        book_id: bookId,
        para_idx: paragraph.para_idx,
        audio_url: result.audioUrl,
        duration: result.duration,
      })

    if (saveError) {
      console.error('[Stream TTS] Failed to save:', saveError)
    }

    return NextResponse.json({
      success: true,
      paraIdx: paragraph.para_idx,
      audioUrl: result.audioUrl,
      duration: result.duration,
      cached: false,
    })
  } catch (error: any) {
    console.error('[Stream TTS] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Audio generation failed' },
      { status: 500 }
    )
  }
}
