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
 * 翻译单个句子
 * 用于逐句对照翻译
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
    const { text, sourceLang, targetLang } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    console.log('[Sentence Translate] Translating:', text.substring(0, 100))

    // 使用OpenAI翻译
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following sentence from ${sourceLang} to ${targetLang}.
Only return the translation, no explanations or notes.
Preserve the original meaning, tone, and style.
If there are proper nouns, keep them in the original language.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const translation = completion.choices[0]?.message?.content?.trim() || '翻译失败'

    console.log('[Sentence Translate] Result:', translation)

    return NextResponse.json({
      translation,
      original: text
    })
  } catch (error: any) {
    console.error('[Sentence Translate] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}
