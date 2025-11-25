import type { ReaderBlock } from '../types'

/**
 * Auto-format text blocks for better reading experience
 *
 * Features:
 * - Merge short paragraphs (<40 chars)
 * - Split long paragraphs (>300 chars)
 * - Remove duplicate empty lines
 * - Fix hyphen line-break words ("inter-\nnational" → "international")
 * - Normalize whitespace
 * - Preserve original block order and IDs
 */
export function cleanBlocks(blocks: ReaderBlock[]): ReaderBlock[] {
  if (!blocks || blocks.length === 0) return []

  // Filter only text paragraphs
  const textBlocks = blocks.filter(b => b.type === 'paragraph' && b.text)
  const imageBlocks = blocks.filter(b => b.type === 'image')

  const cleaned: ReaderBlock[] = []
  let buffer = ''
  let bufferedIds: string[] = []

  const flushBuffer = () => {
    if (!buffer.trim()) return

    // Split long paragraphs
    const sentences = splitLongParagraph(buffer.trim())

    sentences.forEach((text, idx) => {
      cleaned.push({
        type: 'paragraph',
        text,
        id: bufferedIds[0] || `cleaned-${cleaned.length}`,
        order: cleaned.length,
        meta: { merged: bufferedIds.length > 1, split: sentences.length > 1 },
      })
    })

    buffer = ''
    bufferedIds = []
  }

  for (let i = 0; i < textBlocks.length; i++) {
    const block = textBlocks[i]
    let text = block.text || ''

    // Fix hyphen line-breaks
    text = fixHyphenation(text)

    // Normalize whitespace
    text = normalizeWhitespace(text)

    // Skip empty blocks
    if (!text.trim()) continue

    // Merge short paragraphs
    if (text.length < 40 && buffer) {
      buffer += ' ' + text
      bufferedIds.push(block.id || `block-${i}`)
      continue
    }

    // Flush previous buffer
    if (buffer) {
      flushBuffer()
    }

    // Start new buffer or add long paragraph directly
    if (text.length < 40) {
      buffer = text
      bufferedIds = [block.id || `block-${i}`]
    } else {
      buffer = text
      bufferedIds = [block.id || `block-${i}`]
      flushBuffer()
    }
  }

  // Flush remaining buffer
  if (buffer) {
    flushBuffer()
  }

  // Merge back with images at original positions
  const result: ReaderBlock[] = []
  let cleanedIdx = 0
  let imageIdx = 0

  for (const originalBlock of blocks) {
    if (originalBlock.type === 'image') {
      if (imageIdx < imageBlocks.length) {
        result.push(imageBlocks[imageIdx])
        imageIdx++
      }
    } else if (originalBlock.type === 'paragraph') {
      if (cleanedIdx < cleaned.length) {
        result.push(cleaned[cleanedIdx])
        cleanedIdx++
      }
    }
  }

  // Add remaining cleaned blocks
  while (cleanedIdx < cleaned.length) {
    result.push(cleaned[cleanedIdx])
    cleanedIdx++
  }

  return result
}

/**
 * Fix hyphen line-break words
 * "inter-\nnational" → "international"
 */
function fixHyphenation(text: string): string {
  return text.replace(/-\s*\n\s*/g, '')
}

/**
 * Normalize whitespace
 * - Replace multiple spaces with single space
 * - Replace tabs with spaces
 * - Trim each line
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\t/g, ' ')
    .replace(/  +/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join(' ')
}

/**
 * Split long paragraph into smaller chunks
 * Target: ~300 chars per chunk, split at sentence boundaries
 */
function splitLongParagraph(text: string, maxLength: number = 300): string[] {
  if (text.length <= maxLength) return [text]

  // Split by sentence boundaries
  const sentenceEndings = /([.!?]+[\s\n]+|[。!?]+)/g
  const parts: string[] = []
  let current = ''

  const sentences = text.split(sentenceEndings)

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i]

    if (!sentence.trim()) continue

    if (current.length + sentence.length <= maxLength) {
      current += sentence
    } else {
      if (current) parts.push(current.trim())
      current = sentence
    }
  }

  if (current.trim()) parts.push(current.trim())

  return parts.length > 0 ? parts : [text]
}

/**
 * Get auto-format setting from localStorage
 */
export function getAutoFormatSetting(): boolean {
  if (typeof window === 'undefined') return true // SSR default

  try {
    const value = localStorage.getItem('reader:autoFormat')
    return value !== 'false' // Default to true
  } catch {
    return true
  }
}

/**
 * Set auto-format setting to localStorage
 */
export function setAutoFormatSetting(enabled: boolean): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('reader:autoFormat', enabled.toString())
  } catch (e) {
    console.warn('[Auto Format] Failed to save setting:', e)
  }
}
