/**
 * Metadata Enricher Plugin
 * Adds metadata and statistics to blocks
 */

import type { PipelineContext, EnrichResult, Enricher } from '../types'
import type { ReaderBlock } from '@/lib/types'

/**
 * Language detection result (stub)
 */
interface LanguageDetection {
  language: string
  confidence: number
}

/**
 * Metadata enricher plugin implementation
 */
export class MetadataEnricher implements Enricher {
  name = 'metadata-enricher'

  /**
   * Initialize enricher (optional)
   */
  async init(ctx: PipelineContext): Promise<void> {
    // No initialization needed
  }

  /**
   * Enrich blocks with metadata
   */
  async run(ctx: PipelineContext, blocks: ReaderBlock[]): Promise<EnrichResult> {
    const enrichedBlocks = blocks.map((block, index) => {
      if (block.type === 'paragraph' && block.text) {
        // Calculate metadata for text blocks
        const metadata = this.calculateTextMetadata(block.text)

        return {
          ...block,
          meta: {
            ...block.meta,
            ...metadata,
            blockIndex: index,
            enrichedAt: Date.now(),
          },
        }
      }

      // For image blocks, just add index
      return {
        ...block,
        meta: {
          ...block.meta,
          blockIndex: index,
          enrichedAt: Date.now(),
        },
      }
    })

    // Calculate overall statistics
    const overallStats = this.calculateOverallStats(enrichedBlocks)

    return {
      blocks: enrichedBlocks,
      metadata: {
        enricher: this.name,
        enrichedAt: Date.now(),
        blockCount: enrichedBlocks.length,
        ...overallStats,
      },
    }
  }

  /**
   * Calculate metadata for text content
   */
  private calculateTextMetadata(text: string): Record<string, any> {
    const wordCount = this.countWords(text)
    const sentenceCount = this.countSentences(text)
    const charCount = text.length
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const tokensCount = this.estimateTokens(text)
    const detectedLang = this.detectLanguage(text)
    const readingTime = this.estimateReadingTime(wordCount)

    return {
      wordCount,
      sentenceCount,
      charCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      tokensCount,
      detectedLang: detectedLang.language,
      langConfidence: detectedLang.confidence,
      readingTimeSeconds: readingTime,
    }
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }

  /**
   * Count sentences in text
   */
  private countSentences(text: string): number {
    // Simple sentence detection - matches periods, exclamation marks, question marks
    const sentences = text.match(/[^.!?]+[.!?]+/g)
    return sentences ? sentences.length : 1
  }

  /**
   * Estimate token count (rough approximation)
   * Average: 1 token ≈ 4 characters in English
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  /**
   * Detect language (stub implementation)
   * In production, use a library like franc or @vitalets/google-translate-api
   */
  private detectLanguage(text: string): LanguageDetection {
    // Very simple heuristic - check for common characters
    const hasChineseChars = /[\u4e00-\u9fa5]/.test(text)
    const hasJapaneseChars = /[\u3040-\u309f\u30a0-\u30ff]/.test(text)
    const hasKoreanChars = /[\uac00-\ud7af]/.test(text)
    const hasArabicChars = /[\u0600-\u06ff]/.test(text)
    const hasCyrillicChars = /[\u0400-\u04ff]/.test(text)

    if (hasChineseChars) {
      return { language: 'zh', confidence: 0.8 }
    }
    if (hasJapaneseChars) {
      return { language: 'ja', confidence: 0.8 }
    }
    if (hasKoreanChars) {
      return { language: 'ko', confidence: 0.8 }
    }
    if (hasArabicChars) {
      return { language: 'ar', confidence: 0.8 }
    }
    if (hasCyrillicChars) {
      return { language: 'ru', confidence: 0.7 }
    }

    // Default to English
    return { language: 'en', confidence: 0.6 }
  }

  /**
   * Estimate reading time in seconds
   * Average reading speed: ~200-250 words per minute
   */
  private estimateReadingTime(wordCount: number): number {
    const wordsPerMinute = 225 // Average reading speed
    return Math.ceil((wordCount / wordsPerMinute) * 60)
  }

  /**
   * Calculate overall statistics for all blocks
   */
  private calculateOverallStats(blocks: ReaderBlock[]): Record<string, any> {
    let totalWords = 0
    let totalSentences = 0
    let totalChars = 0
    let totalTokens = 0
    let totalReadingTime = 0
    let textBlockCount = 0
    let imageBlockCount = 0

    const languages: Record<string, number> = {}

    for (const block of blocks) {
      if (block.type === 'paragraph') {
        textBlockCount++
        const meta = block.meta || {}
        totalWords += meta.wordCount || 0
        totalSentences += meta.sentenceCount || 0
        totalChars += meta.charCount || 0
        totalTokens += meta.tokensCount || 0
        totalReadingTime += meta.readingTimeSeconds || 0

        const lang = meta.detectedLang || 'en'
        languages[lang] = (languages[lang] || 0) + 1
      } else if (block.type === 'image') {
        imageBlockCount++
      }
    }

    // Find dominant language
    const dominantLang = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'en'

    return {
      totalWords,
      totalSentences,
      totalChars,
      totalTokens,
      totalReadingTimeSeconds: totalReadingTime,
      totalReadingTimeMinutes: Math.ceil(totalReadingTime / 60),
      textBlockCount,
      imageBlockCount,
      avgWordsPerBlock: textBlockCount > 0 ? Math.round(totalWords / textBlockCount) : 0,
      dominantLanguage: dominantLang,
      languageDistribution: languages,
    }
  }
}

/**
 * Create and export metadata enricher instance
 */
export function createMetadataEnricher(): MetadataEnricher {
  return new MetadataEnricher()
}
