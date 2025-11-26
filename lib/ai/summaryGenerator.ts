/**
 * Summary Generator
 * Generates layered summaries with multiple granularity levels
 */

import type { ReaderBlock } from '@/lib/types'

/**
 * Summary level types
 */
export type SummaryLevel = 'oneLine' | 'short' | 'detailed' | 'chapterOutlines'

/**
 * Chapter outline structure
 */
export interface ChapterOutline {
  chapterTitle: string
  outline: string
}

/**
 * Summary result
 */
export interface SummaryResult {
  level: SummaryLevel
  content: string | ChapterOutline[]
  metadata?: {
    wordCount?: number
    generatedAt: number
  }
}

/**
 * Generate summary from blocks
 */
export async function generateSummary(
  blocks: ReaderBlock[],
  level: SummaryLevel = 'short',
  useLLM: boolean = false
): Promise<SummaryResult> {
  if (useLLM) {
    // TODO: Integrate with actual LLM when API key is available
    // For now, fall back to deterministic mock
    return generateMockSummary(blocks, level)
  }

  return generateMockSummary(blocks, level)
}

/**
 * Generate deterministic mock summary
 */
function generateMockSummary(
  blocks: ReaderBlock[],
  level: SummaryLevel
): SummaryResult {
  const textBlocks = blocks.filter(b => b.type === 'paragraph' && b.text)
  const totalWords = textBlocks.reduce((sum, b) => {
    const words = b.text?.split(/\s+/).length || 0
    return sum + words
  }, 0)

  let content: string | ChapterOutline[]

  switch (level) {
    case 'oneLine':
      content = generateOneLineSummary(textBlocks)
      break

    case 'short':
      content = generateShortSummary(textBlocks)
      break

    case 'detailed':
      content = generateDetailedSummary(textBlocks)
      break

    case 'chapterOutlines':
      content = generateChapterOutlines(textBlocks)
      break

    default:
      content = generateShortSummary(textBlocks)
  }

  return {
    level,
    content,
    metadata: {
      wordCount: totalWords,
      generatedAt: Date.now(),
    },
  }
}

/**
 * Generate one-line summary
 */
function generateOneLineSummary(blocks: ReaderBlock[]): string {
  const firstBlock = blocks[0]
  if (!firstBlock?.text) {
    return 'DEMO: A comprehensive overview of the content'
  }

  const firstSentence = firstBlock.text.split(/[.!?]/)[0]
  return `DEMO: ${firstSentence.substring(0, 100)}...`
}

/**
 * Generate short summary (3 bullet points)
 */
function generateShortSummary(blocks: ReaderBlock[]): string {
  const points = []

  // Extract key points from different sections
  const sections = Math.min(3, blocks.length)
  for (let i = 0; i < sections; i++) {
    const block = blocks[Math.floor((i * blocks.length) / sections)]
    if (block?.text) {
      const sentence = block.text.split(/[.!?]/)[0]
      points.push(`• ${sentence.substring(0, 80)}...`)
    }
  }

  return `DEMO: Key Points\n\n${points.join('\n')}`
}

/**
 * Generate detailed summary (200-400 words)
 */
function generateDetailedSummary(blocks: ReaderBlock[]): string {
  const sections = []

  // Introduction
  if (blocks[0]?.text) {
    const intro = blocks[0].text.substring(0, 150)
    sections.push(`**Introduction**\n${intro}...`)
  }

  // Main content
  const middleBlocks = blocks.slice(1, -1)
  if (middleBlocks.length > 0) {
    const mainPoints = middleBlocks
      .filter(b => b.text && b.text.length > 50)
      .slice(0, 3)
      .map(b => {
        const sentence = b.text!.split(/[.!?]/)[0]
        return `- ${sentence}`
      })
      .join('\n')

    sections.push(`**Main Content**\n${mainPoints}`)
  }

  // Conclusion
  const lastBlock = blocks[blocks.length - 1]
  if (lastBlock?.text) {
    const conclusion = lastBlock.text.substring(0, 150)
    sections.push(`**Conclusion**\n${conclusion}...`)
  }

  return `DEMO: Detailed Summary\n\n${sections.join('\n\n')}`
}

/**
 * Generate chapter outlines
 */
function generateChapterOutlines(blocks: ReaderBlock[]): ChapterOutline[] {
  const outlines: ChapterOutline[] = []

  // Divide blocks into chapters (every 3-5 blocks)
  const chapterSize = Math.max(3, Math.floor(blocks.length / 3))

  for (let i = 0; i < blocks.length; i += chapterSize) {
    const chapterBlocks = blocks.slice(i, i + chapterSize)
    const chapterNum = Math.floor(i / chapterSize) + 1

    const outline = chapterBlocks
      .filter(b => b.text)
      .slice(0, 3)
      .map(b => {
        const sentence = b.text!.split(/[.!?]/)[0]
        return `  - ${sentence.substring(0, 60)}...`
      })
      .join('\n')

    outlines.push({
      chapterTitle: `Chapter ${chapterNum}: DEMO Section`,
      outline: outline || '  - Content summary...',
    })
  }

  return outlines
}

/**
 * Stream detailed summary (for server-side streaming)
 */
export async function* streamDetailedSummary(
  blocks: ReaderBlock[]
): AsyncGenerator<string> {
  const summary = generateDetailedSummary(blocks)
  const chunks = summary.split('\n\n')

  for (const chunk of chunks) {
    yield chunk + '\n\n'
    // Simulate streaming delay
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
