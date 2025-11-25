export type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink'

export interface Highlight {
  id: string
  blockId: string
  text: string
  color: HighlightColor
  createdAt: number
  startOffset?: number
  endOffset?: number
}

const STORAGE_KEY_PREFIX = 'reader:highlights:'

/**
 * Color presets for highlights
 */
export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; border: string; text: string }> = {
  yellow: {
    bg: 'bg-yellow-200 dark:bg-yellow-900/40',
    border: 'border-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-200',
  },
  blue: {
    bg: 'bg-blue-200 dark:bg-blue-900/40',
    border: 'border-blue-400',
    text: 'text-blue-900 dark:text-blue-200',
  },
  green: {
    bg: 'bg-green-200 dark:bg-green-900/40',
    border: 'border-green-400',
    text: 'text-green-900 dark:text-green-200',
  },
  pink: {
    bg: 'bg-pink-200 dark:bg-pink-900/40',
    border: 'border-pink-400',
    text: 'text-pink-900 dark:text-pink-200',
  },
}

/**
 * Load highlights from localStorage
 */
export function loadHighlights(bookId: string): Highlight[] {
  if (typeof window === 'undefined') return []

  try {
    const key = STORAGE_KEY_PREFIX + bookId
    const data = localStorage.getItem(key)
    if (!data) return []

    return JSON.parse(data) as Highlight[]
  } catch (e) {
    console.error('[highlightManager] Failed to load:', e)
    return []
  }
}

/**
 * Save highlights to localStorage
 */
export function saveHighlights(bookId: string, highlights: Highlight[]): void {
  if (typeof window === 'undefined') return

  try {
    const key = STORAGE_KEY_PREFIX + bookId
    localStorage.setItem(key, JSON.stringify(highlights))
  } catch (e) {
    console.error('[highlightManager] Failed to save:', e)
  }
}

/**
 * Add a new highlight
 */
export function addHighlight(
  bookId: string,
  blockId: string,
  text: string,
  color: HighlightColor,
  startOffset?: number,
  endOffset?: number
): Highlight {
  const highlights = loadHighlights(bookId)

  const newHighlight: Highlight = {
    id: `highlight-${Date.now()}`,
    blockId,
    text,
    color,
    createdAt: Date.now(),
    startOffset,
    endOffset,
  }

  highlights.push(newHighlight)
  saveHighlights(bookId, highlights)

  return newHighlight
}

/**
 * Remove a highlight
 */
export function removeHighlight(bookId: string, highlightId: string): void {
  const highlights = loadHighlights(bookId)
  const filtered = highlights.filter(h => h.id !== highlightId)
  saveHighlights(bookId, filtered)
}

/**
 * Update highlight color
 */
export function updateHighlightColor(
  bookId: string,
  highlightId: string,
  color: HighlightColor
): void {
  const highlights = loadHighlights(bookId)
  const updated = highlights.map(h =>
    h.id === highlightId ? { ...h, color } : h
  )
  saveHighlights(bookId, updated)
}

/**
 * Get highlights for a specific block
 */
export function getBlockHighlights(bookId: string, blockId: string): Highlight[] {
  const highlights = loadHighlights(bookId)
  return highlights.filter(h => h.blockId === blockId)
}

/**
 * Clear all highlights for a book
 */
export function clearHighlights(bookId: string): void {
  if (typeof window === 'undefined') return

  try {
    const key = STORAGE_KEY_PREFIX + bookId
    localStorage.removeItem(key)
  } catch (e) {
    console.error('[highlightManager] Failed to clear:', e)
  }
}

/**
 * Apply highlight to text (returns JSX with highlighted spans)
 */
export function applyHighlightsToText(
  text: string,
  highlights: Highlight[]
): Array<{ text: string; highlight?: Highlight }> {
  if (highlights.length === 0) {
    return [{ text }]
  }

  // Sort highlights by start position
  const sorted = [...highlights].sort((a, b) =>
    (a.startOffset || 0) - (b.startOffset || 0)
  )

  const segments: Array<{ text: string; highlight?: Highlight }> = []
  let lastIndex = 0

  for (const highlight of sorted) {
    const start = highlight.startOffset || text.indexOf(highlight.text)
    const end = highlight.endOffset || (start + highlight.text.length)

    if (start === -1) continue // Text not found

    // Add text before highlight
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start) })
    }

    // Add highlighted text
    segments.push({
      text: text.slice(start, end),
      highlight,
    })

    lastIndex = end
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) })
  }

  return segments
}
