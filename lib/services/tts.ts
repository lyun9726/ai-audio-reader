import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

/**
 * Generate speech audio from text using OpenAI TTS
 */
export async function generateSpeech(
  text: string,
  voice: TTSVoice = 'nova',
  speed: number = 1.0
): Promise<Buffer> {
  console.log('[OpenAI TTS] Starting request...')
  console.log('[OpenAI TTS] API Base URL:', process.env.OPENAI_BASE_URL)
  console.log('[OpenAI TTS] Model: tts-1')
  console.log('[OpenAI TTS] Text preview:', text.substring(0, 100) + '...')

  try {
    const requestStart = Date.now()
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // or 'tts-1-hd' for higher quality
      voice: voice,
      input: text,
      speed: speed,
    })
    const apiTime = Date.now() - requestStart
    console.log(`[OpenAI TTS] ✓ API response received in ${apiTime}ms`)

    const bufferStart = Date.now()
    const buffer = Buffer.from(await mp3.arrayBuffer())
    const bufferTime = Date.now() - bufferStart
    console.log(`[OpenAI TTS] ✓ Buffer conversion completed in ${bufferTime}ms`)
    console.log(`[OpenAI TTS] ✓ Total time: ${apiTime + bufferTime}ms`)

    return buffer
  } catch (error: any) {
    console.error('[OpenAI TTS] ✗ Generation error:', error)
    console.error('[OpenAI TTS] Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      type: error.type,
      code: error.code,
    })
    throw new Error(`Speech generation failed: ${error.message}`)
  }
}

/**
 * Upload audio buffer to Supabase Storage
 */
export async function uploadAudioToStorage(
  bookId: string,
  paraIdx: number,
  audioBuffer: Buffer
): Promise<string> {
  const supabase = await createClient()

  const fileName = `${bookId}/${paraIdx}.mp3`
  console.log(`[Storage] Uploading file: ${fileName}, size: ${audioBuffer.length} bytes`)

  try {
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (error) {
      console.error('[Storage] Upload error:', error)
      console.error('[Storage] Error details:', {
        message: error.message,
        name: error.name,
        statusCode: (error as any).statusCode,
      })

      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      console.error('[Storage] Available buckets:', buckets?.map(b => b.name))

      throw new Error(`Failed to upload audio file: ${error.message}`)
    }

    console.log('[Storage] ✓ Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    console.log('[Storage] ✓ Public URL:', publicUrl)
    return publicUrl
  } catch (error: any) {
    console.error('[Storage] Unexpected error during upload:', error)
    throw error
  }
}

/**
 * Generate audio for a single paragraph
 */
export async function generateParagraphAudio(
  bookId: string,
  paraIdx: number,
  text: string,
  voice: TTSVoice = 'nova',
  speed: number = 1.0
): Promise<{ audioUrl: string; duration: number }> {
  console.log(`[TTS] Starting audio generation for paragraph ${paraIdx}`)
  console.log(`[TTS] Text length: ${text.length} characters`)
  console.log(`[TTS] Voice: ${voice}, Speed: ${speed}`)

  try {
    // Generate speech
    console.log(`[TTS] Step 1: Calling OpenAI TTS API...`)
    const startTime = Date.now()
    const audioBuffer = await generateSpeech(text, voice, speed)
    const ttsTime = Date.now() - startTime
    console.log(`[TTS] ✓ TTS generation completed in ${ttsTime}ms, buffer size: ${audioBuffer.length} bytes`)

    // Upload to storage
    console.log(`[TTS] Step 2: Uploading to Supabase Storage...`)
    const uploadStartTime = Date.now()
    const audioUrl = await uploadAudioToStorage(bookId, paraIdx, audioBuffer)
    const uploadTime = Date.now() - uploadStartTime
    console.log(`[TTS] ✓ Upload completed in ${uploadTime}ms`)
    console.log(`[TTS] ✓ Audio URL: ${audioUrl}`)

    // Estimate duration (rough: 150 words per minute at 1.0 speed)
    const wordCount = text.split(/\s+/).length
    const duration = (wordCount / 150) * 60 / speed
    console.log(`[TTS] ✓ Estimated duration: ${duration.toFixed(2)}s (${wordCount} words)`)

    return {
      audioUrl,
      duration,
    }
  } catch (error: any) {
    console.error(`[TTS] ✗ Failed at paragraph ${paraIdx}:`, error)
    console.error(`[TTS] Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    throw error
  }
}

/**
 * Generate audio for all paragraphs in a book
 */
export async function generateBookAudio(
  bookId: string,
  voice: TTSVoice = 'nova',
  speed: number = 1.0,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const supabase = await createClient()

  // Fetch paragraphs with translations
  const { data: paragraphs, error } = await supabase
    .from('book_paragraphs')
    .select('id, para_idx, text_translated')
    .eq('book_id', bookId)
    .not('text_translated', 'is', null)
    .order('para_idx', { ascending: true })

  if (error || !paragraphs || paragraphs.length === 0) {
    throw new Error('No translated paragraphs found')
  }

  // Check which paragraphs already have audio
  const { data: existingAudio } = await supabase
    .from('book_audio_manifest')
    .select('para_idx')
    .eq('book_id', bookId)

  const existingIndices = new Set(existingAudio?.map(a => a.para_idx) || [])

  // Filter paragraphs that need audio generation
  const paragraphsToProcess = paragraphs.filter(
    p => !existingIndices.has(p.para_idx)
  )

  if (paragraphsToProcess.length === 0) {
    return // All audio already generated
  }

  // Generate audio in batches for better performance
  console.log(`[TTS] Starting audio generation for ${paragraphsToProcess.length} paragraphs`)
  const BATCH_SIZE = 5 // Process 5 paragraphs at a time
  let completed = 0

  for (let i = 0; i < paragraphsToProcess.length; i += BATCH_SIZE) {
    const batch = paragraphsToProcess.slice(i, i + BATCH_SIZE)

    console.log(`[TTS] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(paragraphsToProcess.length / BATCH_SIZE)}`)

    // Process batch in parallel
    const promises = batch.map(async (para) => {
      try {
        const { audioUrl, duration } = await generateParagraphAudio(
          bookId,
          para.para_idx,
          para.text_translated!,
          voice,
          speed
        )

        // Save to manifest
        await supabase.from('book_audio_manifest').insert({
          book_id: bookId,
          para_idx: para.para_idx,
          audio_url: audioUrl,
          duration: duration,
        })

        console.log(`[TTS] ✓ Generated audio for paragraph ${para.para_idx}`)
        return true
      } catch (error) {
        console.error(`[TTS] ✗ Failed to generate audio for paragraph ${para.para_idx}:`, error)
        return false
      }
    })

    await Promise.all(promises)
    completed += batch.length

    if (onProgress) {
      onProgress(completed, paragraphsToProcess.length)
    }

    // Small delay between batches
    if (i + BATCH_SIZE < paragraphsToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log(`[TTS] Audio generation complete! Processed ${paragraphsToProcess.length} paragraphs`)
}
