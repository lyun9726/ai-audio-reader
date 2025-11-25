import { NextRequest, NextResponse } from 'next/server'

interface TranslateItem {
  id: string
  text: string
}

interface TranslateRequest {
  items: TranslateItem[]
  targetLanguage?: string
  batchSize?: number
}

interface TranslateResult {
  id: string
  original: string
  translation: string
}

export async function POST(req: NextRequest) {
  try {
    const body: TranslateRequest = await req.json()
    const { items, targetLanguage = 'zh', batchSize = 32 } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
    }

    // Split into batches
    const batches: TranslateItem[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    // Process batches (in production, use actual translation API)
    const results: TranslateResult[] = []

    for (const batch of batches) {
      const batchResults = await processBatch(batch, targetLanguage)
      results.push(...batchResults)
    }

    return NextResponse.json({
      results,
      total: results.length,
    })
  } catch (error: any) {
    console.error('[Translation Error]', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    )
  }
}

// Process a single batch
async function processBatch(
  batch: TranslateItem[],
  targetLanguage: string
): Promise<TranslateResult[]> {
  const { simpleCache } = await import('@/lib/cache/simpleCache')

  // Check cache first
  const results: TranslateResult[] = []
  const uncachedItems: TranslateItem[] = []

  for (const item of batch) {
    const cacheKey = `${targetLanguage}:${item.text}`
    if (simpleCache.has(cacheKey)) {
      results.push({
        id: item.id,
        original: item.text,
        translation: simpleCache.get(cacheKey)!,
      })
    } else {
      uncachedItems.push(item)
    }
  }

  if (uncachedItems.length === 0) {
    return results
  }

  // Check if translation engine exists
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Return mock translations if no API key
    const mockResults = uncachedItems.map(item => {
      const translation = `${item.text} (ZH DEMO)`
      simpleCache.set(`${targetLanguage}:${item.text}`, translation)
      return {
        id: item.id,
        original: item.text,
        translation,
      }
    })
    return [...results, ...mockResults]
  }

  // Use existing translation logic from translateBatch.ts if available
  try {
    // Import from existing core module
    const { translateBatch } = await import('@/core/translate/translateBatch')
    const translatedItems = await translateBatch(uncachedItems, {
      targetLang: targetLanguage,
      batchSize: uncachedItems.length,
    })

    const newResults = translatedItems.map((item: any) => {
      const translation = item.translation || item.original
      simpleCache.set(`${targetLanguage}:${item.text}`, translation)
      return {
        id: item.id,
        original: item.original,
        translation,
      }
    })

    return [...results, ...newResults]
  } catch (importError) {
    // Fallback: use simple LLM call
    const llmResults = await callLLMTranslation(uncachedItems, targetLanguage)
    for (const result of llmResults) {
      simpleCache.set(`${targetLanguage}:${result.original}`, result.translation)
    }
    return [...results, ...llmResults]
  }
}

// Fallback LLM translation
async function callLLMTranslation(
  batch: TranslateItem[],
  targetLanguage: string
): Promise<TranslateResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    // Mock response
    return batch.map(item => ({
      id: item.id,
      original: item.text,
      translation: `[Translated to ${targetLanguage}] ${item.text.slice(0, 50)}...`,
    }))
  }

  try {
    // Use Claude API for translation
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `Translate the following paragraphs to ${getLanguageName(targetLanguage)}. Return ONLY a JSON array with the same order:\n\n${batch.map((item, i) => `${i + 1}. ${item.text}`).join('\n\n')}\n\nFormat: [{"translation": "..."},...]`,
          },
        ],
      }),
    })

    const data = await response.json()
    const content = data.content?.[0]?.text || '[]'

    // Parse JSON response
    const translations = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] || '[]')

    return batch.map((item, index) => ({
      id: item.id,
      original: item.text,
      translation: translations[index]?.translation || item.text,
    }))
  } catch (error) {
    console.error('[LLM Translation Error]', error)
    // Return originals on error
    return batch.map(item => ({
      id: item.id,
      original: item.text,
      translation: item.text,
    }))
  }
}

// Helper: Get full language name
function getLanguageName(code: string): string {
  const map: Record<string, string> = {
    zh: 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    ja: 'Japanese',
    ko: 'Korean',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ru: 'Russian',
    ar: 'Arabic',
  }
  return map[code] || code
}
