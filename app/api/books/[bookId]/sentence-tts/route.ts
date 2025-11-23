import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * 生成单个句子的TTS音频
 * 用于逐句播放
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const supabase = await createClient()

    // 检查认证
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookId } = await params
    const { text, lang, speed = 1.0 } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    console.log('[Sentence TTS] Generating audio for:', text.substring(0, 50))

    // 选择合适的语音
    const voice = selectVoiceForLanguage(lang)

    // 生成TTS
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed))
    })

    const buffer = Buffer.from(await mp3Response.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error: any) {
    console.error('[Sentence TTS] Error:', error)
    return NextResponse.json(
      { error: error.message || 'TTS generation failed' },
      { status: 500 }
    )
  }
}

/**
 * 根据语言选择合适的语音
 */
function selectVoiceForLanguage(lang: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
  // 根据语言选择不同的语音
  if (lang === 'zh' || lang.startsWith('zh-')) {
    return 'nova' // 中文使用Nova
  } else if (lang === 'ja') {
    return 'shimmer' // 日语使用Shimmer
  } else if (lang === 'ko') {
    return 'fable' // 韩语使用Fable
  } else {
    return 'alloy' // 默认使用Alloy
  }
}
