import type { ReaderBlock } from '../types'

/**
 * Extract plain text from ReaderBlock[]
 */
export function extractTextFromBlocks(blocks: ReaderBlock[]): string {
  return blocks
    .filter(block => block.type === 'paragraph' && block.text)
    .map(block => block.text)
    .join('\n\n')
}

/**
 * Truncate text to max tokens (rough estimation)
 */
export function truncateText(text: string, maxTokens: number = 4000): string {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4
  if (text.length <= maxChars) return text

  return text.slice(0, maxChars) + '...'
}

/**
 * Create streaming text response compatible with Vercel AI SDK
 */
export function createStreamResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
