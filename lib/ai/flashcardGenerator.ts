/**
 * Flashcard Generator
 * Generates Q&A flashcards with spaced repetition scheduling
 */

import type { ReaderBlock } from '@/lib/types'

/**
 * Flashcard structure
 */
export interface Flashcard {
  id: string
  front: string
  back: string
  blockId?: string
  tags?: string[]
  createdAt: number
  // SRS fields
  easeFactor: number // 1.3 - 2.5+
  interval: number // days until next review
  repetitions: number
  nextReview: number // timestamp
  lastReviewed?: number
}

/**
 * Review result
 */
export type ReviewResult = 'again' | 'hard' | 'good' | 'easy'

/**
 * Generate flashcards from blocks
 */
export async function generateFlashcards(
  blocks: ReaderBlock[],
  count: number = 20,
  useLLM: boolean = false
): Promise<Flashcard[]> {
  if (useLLM) {
    // TODO: Integrate with actual LLM when API key is available
    return generateMockFlashcards(blocks, count)
  }

  return generateMockFlashcards(blocks, count)
}

/**
 * Generate deterministic mock flashcards
 */
function generateMockFlashcards(
  blocks: ReaderBlock[],
  count: number
): Flashcard[] {
  const textBlocks = blocks.filter(b => b.type === 'paragraph' && b.text)
  const cards: Flashcard[] = []

  for (let i = 0; i < Math.min(count, textBlocks.length * 3); i++) {
    const blockIndex = i % textBlocks.length
    const block = textBlocks[blockIndex]

    if (!block.text) continue

    const card = createFlashcardFromBlock(block, i)
    cards.push(card)
  }

  return cards.slice(0, count)
}

/**
 * Create flashcard from block
 */
function createFlashcardFromBlock(block: ReaderBlock, index: number): Flashcard {
  const sentences = block.text!.split(/[.!?]/).filter(s => s.trim().length > 20)
  const sentence = sentences[index % sentences.length] || sentences[0]

  // Extract key concept
  const words = sentence.trim().split(/\s+/)
  const keyPhrase = words.slice(0, 5).join(' ')

  const front = `DEMO: What is ${keyPhrase}?`
  const back = sentence.substring(0, 150)

  return {
    id: `flashcard-${index}-${Date.now()}`,
    front,
    back,
    blockId: block.id,
    tags: ['demo', 'auto-generated'],
    createdAt: Date.now(),
    easeFactor: 2.5, // Default ease factor
    interval: 1, // Review tomorrow
    repetitions: 0,
    nextReview: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
  }
}

/**
 * Update flashcard based on review result (SM-2 algorithm)
 */
export function updateFlashcard(
  card: Flashcard,
  result: ReviewResult
): Flashcard {
  const now = Date.now()
  let { easeFactor, interval, repetitions } = card

  switch (result) {
    case 'again':
      // Reset progress
      repetitions = 0
      interval = 1
      easeFactor = Math.max(1.3, easeFactor - 0.2)
      break

    case 'hard':
      repetitions++
      easeFactor = Math.max(1.3, easeFactor - 0.15)
      interval = Math.max(1, interval * 1.2)
      break

    case 'good':
      repetitions++
      if (repetitions === 1) {
        interval = 1
      } else if (repetitions === 2) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      break

    case 'easy':
      repetitions++
      easeFactor = Math.min(2.5, easeFactor + 0.15)
      if (repetitions === 1) {
        interval = 4
      } else {
        interval = Math.round(interval * easeFactor * 1.3)
      }
      break
  }

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    lastReviewed: now,
    nextReview: now + interval * 24 * 60 * 60 * 1000,
  }
}

/**
 * Get flashcards due for review
 */
export function getDueFlashcards(cards: Flashcard[]): Flashcard[] {
  const now = Date.now()
  return cards
    .filter(card => card.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview)
}

/**
 * Get flashcard statistics
 */
export function getFlashcardStats(cards: Flashcard[]): {
  total: number
  new: number
  learning: number
  review: number
  due: number
  averageEase: number
} {
  const now = Date.now()
  const newCards = cards.filter(c => c.repetitions === 0)
  const learningCards = cards.filter(c => c.repetitions > 0 && c.repetitions < 3)
  const reviewCards = cards.filter(c => c.repetitions >= 3)
  const dueCards = cards.filter(c => c.nextReview <= now)

  const totalEase = cards.reduce((sum, c) => sum + c.easeFactor, 0)
  const averageEase = cards.length > 0 ? totalEase / cards.length : 2.5

  return {
    total: cards.length,
    new: newCards.length,
    learning: learningCards.length,
    review: reviewCards.length,
    due: dueCards.length,
    averageEase: Math.round(averageEase * 100) / 100,
  }
}

/**
 * Export flashcards to CSV
 */
export function exportFlashcardsToCSV(cards: Flashcard[]): string {
  const headers = ['Front', 'Back', 'Tags', 'Ease Factor', 'Interval (days)', 'Repetitions']
  const rows = cards.map(card => [
    `"${card.front.replace(/"/g, '""')}"`,
    `"${card.back.replace(/"/g, '""')}"`,
    `"${(card.tags || []).join(', ')}"`,
    card.easeFactor.toString(),
    card.interval.toString(),
    card.repetitions.toString(),
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

/**
 * Import flashcards from CSV
 */
export function importFlashcardsFromCSV(csv: string): Flashcard[] {
  const lines = csv.split('\n').filter(l => l.trim())
  const cards: Flashcard[] = []

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const match = lines[i].match(/"([^"]*)","([^"]*)","([^"]*)",([^,]*),([^,]*),([^,]*)/)
    if (match) {
      const [, front, back, tagsStr, ease, interval, reps] = match
      cards.push({
        id: `imported-${i}-${Date.now()}`,
        front,
        back,
        tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
        createdAt: Date.now(),
        easeFactor: parseFloat(ease) || 2.5,
        interval: parseInt(interval) || 1,
        repetitions: parseInt(reps) || 0,
        nextReview: Date.now() + parseInt(interval) * 24 * 60 * 60 * 1000,
      })
    }
  }

  return cards
}
