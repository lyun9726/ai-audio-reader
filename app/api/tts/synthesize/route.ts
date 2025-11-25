import { NextRequest, NextResponse } from 'next/server'

interface TTSRequest {
  text: string
  voiceId?: string
  rate?: number
  pitch?: number
}

export async function POST(req: NextRequest) {
  try {
    const body: TTSRequest = await req.json()
    const { text, voiceId = 'alloy', rate = 1.0, pitch = 1.0 } = body

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Demo mode: return base64 audio data URL
      const { TTSProvider } = await import('@/lib/tts/provider')
      const result = await TTSProvider.synthesize({ text, voiceId, rate, pitch })

      return NextResponse.json({
        audioUrl: result.audioUrl,
        metadata: result.metadata,
      })
    }

    // Call OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceId,
        speed: rate,
        // Note: OpenAI TTS doesn't support pitch directly
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[TTS Error]', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'TTS synthesis failed' },
        { status: response.status }
      )
    }

    // Return audio stream
    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error('[TTS Synthesis Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
