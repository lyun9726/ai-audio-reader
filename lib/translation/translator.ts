/**
 * Translation Service
 * Supports multiple target languages with demo mode fallback
 */

export type SupportedLanguage = 'zh' | 'en' | 'jp' | 'es' | 'fr'

export interface TranslationResult {
  original: string
  translated: string
  targetLang: SupportedLanguage
  sourceLang?: string
  timestamp: number
  demo: boolean
}

/**
 * Language names for display
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  zh: '中文',
  en: 'English',
  jp: '日本語',
  es: 'Español',
  fr: 'Français',
}

/**
 * Translate text to target language
 * Falls back to deterministic demo if no API key available
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  useLLM: boolean = false
): Promise<TranslationResult> {
  if (useLLM) {
    // TODO: Integrate with actual translation API when key is available
    // For now, use mock even if useLLM is true
    return generateMockTranslation(text, targetLang)
  }

  return generateMockTranslation(text, targetLang)
}

/**
 * Batch translate multiple texts
 */
export async function translateBatch(
  texts: string[],
  targetLang: SupportedLanguage,
  useLLM: boolean = false
): Promise<TranslationResult[]> {
  const results: TranslationResult[] = []

  for (const text of texts) {
    const result = await translateText(text, targetLang, useLLM)
    results.push(result)
  }

  return results
}

/**
 * Generate deterministic mock translation
 */
function generateMockTranslation(
  text: string,
  targetLang: SupportedLanguage
): TranslationResult {
  const translations: Record<SupportedLanguage, string> = {
    zh: `【中文翻译】${text.substring(0, 50)}...`,
    en: `[English Translation] ${text.substring(0, 50)}...`,
    jp: `【日本語翻訳】${text.substring(0, 50)}...`,
    es: `[Traducción Española] ${text.substring(0, 50)}...`,
    fr: `[Traduction Française] ${text.substring(0, 50)}...`,
  }

  return {
    original: text,
    translated: translations[targetLang],
    targetLang,
    sourceLang: 'auto',
    timestamp: Date.now(),
    demo: true,
  }
}

/**
 * Detect source language (mock)
 */
export function detectLanguage(text: string): string {
  // Simple heuristic for demo
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh'
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'jp'
  if (/[áéíóúñ¿¡]/i.test(text)) return 'es'
  if (/[àâäéèêëïîôùûüÿ]/i.test(text)) return 'fr'
  return 'en'
}

/**
 * Translation cache for performance
 */
class TranslationCache {
  private cache: Map<string, TranslationResult> = new Map()
  private maxSize = 1000

  private getCacheKey(text: string, targetLang: SupportedLanguage): string {
    return `${targetLang}:${text.substring(0, 100)}`
  }

  get(text: string, targetLang: SupportedLanguage): TranslationResult | null {
    const key = this.getCacheKey(text, targetLang)
    return this.cache.get(key) || null
  }

  set(result: TranslationResult): void {
    const key = this.getCacheKey(result.original, result.targetLang)

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, result)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global cache instance
const translationCache = new TranslationCache()

/**
 * Translate with caching
 */
export async function translateWithCache(
  text: string,
  targetLang: SupportedLanguage,
  useLLM: boolean = false
): Promise<TranslationResult> {
  // Check cache first
  const cached = translationCache.get(text, targetLang)
  if (cached) {
    return cached
  }

  // Translate and cache
  const result = await translateText(text, targetLang, useLLM)
  translationCache.set(result)

  return result
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear()
}

/**
 * Get cache stats
 */
export function getTranslationCacheStats(): { size: number; maxSize: number } {
  return {
    size: translationCache.size(),
    maxSize: 1000,
  }
}
