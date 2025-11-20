import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

interface TranslationResult {
  translatedText: string
  tokensUsed: number
}

/**
 * Translate a single text using OpenAI with retry logic
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  retryCount = 0
): Promise<TranslationResult> {
  const langMap: Record<string, string> = {
    en: 'English',
    zh: 'Simplified Chinese',
    ja: 'Japanese',
    es: 'Spanish',
    fr: 'French',
  }

  const sourceLanguage = langMap[sourceLang] || sourceLang
  const targetLanguage = langMap[targetLang] || targetLang

  const systemPrompt = `You are a professional translator. Translate the following ${sourceLanguage} content into fluent, idiomatic ${targetLanguage}. Keep tone and register consistent. Preserve paragraph breaks and formatting. Output only the translation without any commentary or explanations.`

  try {
    if (retryCount === 0) {
      console.log('[Translator] Starting translation...')
      console.log('[Translator] Base URL:', process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1')
      console.log('[Translator] API Key exists:', !!process.env.OPENAI_API_KEY)
      console.log('[Translator] Source:', sourceLanguage, '→ Target:', targetLanguage)
    } else {
      console.log(`[Translator] Retry attempt ${retryCount}...`)
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model for translation
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
    })

    const translatedText = response.choices[0]?.message?.content || ''
    const tokensUsed = response.usage?.total_tokens || 0

    console.log('[Translator] Translation successful, tokens used:', tokensUsed)

    return {
      translatedText: translatedText.trim(),
      tokensUsed,
    }
  } catch (error: any) {
    console.error('[Translator] Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status,
      retryCount,
    })

    // Retry logic for rate limits
    if (error.status === 429 && retryCount < 3) {
      const waitTime = Math.pow(2, retryCount) * 2000 // Exponential backoff: 2s, 4s, 8s
      console.log(`[Translator] Rate limit hit, waiting ${waitTime}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return translateText(text, sourceLang, targetLang, retryCount + 1)
    }

    // More specific error messages
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to OpenAI API. Please check your network or OPENAI_BASE_URL.')
    } else if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check OPENAI_API_KEY in .env.local')
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded after 3 retries. Please wait a few minutes and try again.')
    } else if (error.status === 500) {
      throw new Error('OpenAI API server error. Please try again later.')
    }

    throw new Error(`Translation failed: ${error.message}`)
  }
}

/**
 * Translate multiple texts in batch (with concurrent processing for paid APIs)
 */
export async function translateBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string,
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{ text: string; tokens: number }>> {
  const results: Array<{ text: string; tokens: number }> = []

  console.log(`[Translator] Starting batch translation of ${texts.length} paragraphs...`)
  console.log('[Translator] Using concurrent processing (5 at a time)')

  // Process in batches of 5 for better performance
  const BATCH_SIZE = 5

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)

    console.log(`[Translator] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (paragraphs ${i + 1}-${Math.min(i + BATCH_SIZE, texts.length)})`)

    try {
      // Translate batch in parallel
      const promises = batch.map(text => translateText(text, sourceLang, targetLang))
      const batchResults = await Promise.all(promises)

      results.push(...batchResults.map(r => ({
        text: r.translatedText,
        tokens: r.tokensUsed,
      })))

      if (onProgress) {
        onProgress(results.length, texts.length)
      }

      console.log(`[Translator] ✓ Batch complete (${results.length}/${texts.length})`)

      // Small delay between batches
      if (i + BATCH_SIZE < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error: any) {
      console.error(`[Translator] Batch failed:`, error.message)

      // If rate limit, wait and retry this batch
      if (error.message.includes('Rate limit')) {
        console.log('[Translator] Rate limit hit, waiting 5 seconds...')
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Retry batch sequentially
        for (const text of batch) {
          try {
            const result = await translateText(text, sourceLang, targetLang)
            results.push({
              text: result.translatedText,
              tokens: result.tokensUsed,
            })
            if (onProgress) {
              onProgress(results.length, texts.length)
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
          } catch (retryError: any) {
            console.error(`[Translator] Retry failed:`, retryError.message)
            throw retryError
          }
        }
      } else {
        throw error
      }
    }
  }

  console.log(`[Translator] Batch translation complete! Translated ${results.length} paragraphs`)
  return results
}

/**
 * Estimate cost for translation
 */
export function estimateTranslationCost(
  totalCharacters: number,
  model: string = 'gpt-4o-mini'
): { estimatedTokens: number; estimatedCostUSD: number } {
  // Rough estimate: 1 token ≈ 4 characters (including input + output)
  const estimatedTokens = Math.ceil(totalCharacters / 2) // Input + output combined

  // Pricing (as of 2024, adjust as needed)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 }, // per token
    'gpt-4o': { input: 0.005 / 1000, output: 0.015 / 1000 },
  }

  const modelPricing = pricing[model] || pricing['gpt-4o-mini']
  const estimatedCostUSD =
    estimatedTokens * 0.5 * modelPricing.input +
    estimatedTokens * 0.5 * modelPricing.output

  return {
    estimatedTokens,
    estimatedCostUSD,
  }
}
