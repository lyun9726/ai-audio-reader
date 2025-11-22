import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * Stream TTS for original text (without translation)
 * Useful for language learning - hearing the original pronunciation
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const supabase = await createClient()
    const { bookId } = await params
    const { paraIdx, voice = 'alloy', speed = 1.0, model = 'tts-1' } = await request.json()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify book ownership
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, original_lang')
      .eq('id', bookId)
      .eq('owner_user_id', user.id)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Get paragraph
    const { data: paragraph, error: paraError } = await supabase
      .from('book_paragraphs')
      .select('text_original')
      .eq('book_id', bookId)
      .eq('para_idx', paraIdx)
      .single()

    if (paraError || !paragraph) {
      return NextResponse.json(
        { error: `Paragraph ${paraIdx} not found` },
        { status: 404 }
      )
    }

    const originalText = paragraph.text_original
    if (!originalText || originalText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Original text is empty' },
        { status: 400 }
      )
    }

    // Select voice based on original language
    let selectedVoice = voice
    const lang = book.original_lang || 'en'

    // Voice mapping for different languages
    const voiceMap: Record<string, string[]> = {
      'en': ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      'zh': ['alloy', 'shimmer'], // OpenAI TTS works reasonably for Chinese
      'ja': ['alloy', 'nova'],     // Works for Japanese
      'es': ['nova', 'alloy'],     // Spanish
      'fr': ['shimmer', 'alloy'],  // French
    }

    // If voice is not specified, pick default for language
    if (!voice || voice === 'auto') {
      selectedVoice = voiceMap[lang]?.[0] || 'alloy'
    }

    console.log(`[TTS Original] Generating audio for paragraph ${paraIdx}, lang: ${lang}, voice: ${selectedVoice}, length: ${originalText.length}`)

    // Generate TTS using OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const mp3Response = await openai.audio.speech.create({
      model: model,
      voice: selectedVoice as any,
      input: originalText,
      speed: speed,
    })

    // Convert to buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer())

    // Calculate approximate duration (words / 150 wpm * 60 * (1/speed))
    const wordCount = originalText.split(/\s+/).length
    const baseDuration = (wordCount / 150) * 60
    const duration = baseDuration / speed

    // Upload to Supabase Storage
    const fileName = `${bookId}/${paraIdx}_original_${Date.now()}.mp3`
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('[TTS Original] Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload audio' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    console.log(`[TTS Original] ✓ Audio generated and uploaded to ${publicUrl}`)

    return NextResponse.json({
      audioUrl: publicUrl,
      duration: Math.round(duration),
      voice: selectedVoice,
      language: lang,
    })
  } catch (error: any) {
    console.error('[TTS Original] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    )
  }
}
