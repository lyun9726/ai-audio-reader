/**
 * Translation API Route
 * POST /api/translate - Translate text to target language
 */

import { NextRequest, NextResponse } from 'next/server'
import { translateWithCache, type SupportedLanguage } from '@/lib/translation/translator'

/**
 * POST /api/translate
 * Translate text to target language
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLang } = body as {
      text: string
      targetLang: SupportedLanguage
    }

    // Validate input
    if (!text || !targetLang) {
      return NextResponse.json(
        { success: false, error: 'text and targetLang are required' },
        { status: 400 }
      )
    }

    // Validate target language
    const validLangs: SupportedLanguage[] = ['zh', 'en', 'jp', 'es', 'fr']
    if (!validLangs.includes(targetLang)) {
      return NextResponse.json(
        {
          success: false,
          error: `targetLang must be one of: ${validLangs.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Check if we should use LLM (API key available)
    const hasAPIKey = !!(
      process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
    )

    // Translate with caching
    const result = await translateWithCache(text, targetLang, hasAPIKey)

    return NextResponse.json({
      success: true,
      translated: result.translated,
      original: result.original,
      targetLang: result.targetLang,
      sourceLang: result.sourceLang,
      demo: result.demo,
    })
  } catch (error) {
    console.error('[Translate API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/translate
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/translate',
    method: 'POST',
    description: 'Translate text to target language with caching',
    body: {
      text: 'string (text to translate)',
      targetLang: 'zh | en | jp | es | fr',
    },
    response: {
      success: 'boolean',
      translated: 'string (translated text)',
      original: 'string (original text)',
      targetLang: 'string',
      sourceLang: 'string (detected or auto)',
      demo: 'boolean (true if using mock translator)',
    },
    supportedLanguages: {
      zh: '中文 (Chinese)',
      en: 'English',
      jp: '日本語 (Japanese)',
      es: 'Español (Spanish)',
      fr: 'Français (French)',
    },
  })
}
