import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateBookAudio, TTSVoice } from '@/lib/services/tts'

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
    const { voice, speed } = await request.json()

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
      .update({ status: 'generating_audio' })
      .eq('id', bookId)

    // Generate audio
    await generateBookAudio(
      bookId,
      (voice as TTSVoice) || 'nova',
      speed || 1.0
    )

    // Update book status back to ready
    await supabase
      .from('books')
      .update({ status: 'ready' })
      .eq('id', bookId)

    return NextResponse.json({
      success: true,
      message: 'Audio generation complete',
    })
  } catch (error: any) {
    console.error('TTS error:', error)

    // Update book status to error
    const supabase = await createClient()
    await supabase
      .from('books')
      .update({ status: 'error' })
      .eq('id', bookId)

    return NextResponse.json(
      { error: error.message || 'Audio generation failed' },
      { status: 500 }
    )
  }
}
