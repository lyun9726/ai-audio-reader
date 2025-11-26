/**
 * Generate Flashcards API Route
 * Creates flashcards for spaced repetition learning
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateFlashcards } from '@/lib/ai/flashcardGenerator'
import type { ReaderBlock } from '@/lib/types'

/**
 * POST /api/ai/generate-flashcards
 * Generate flashcards from blocks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookId,
      blocks,
      count = 20,
    } = body as {
      bookId: string
      blocks: ReaderBlock[]
      count?: number
    }

    // Validate input
    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { success: false, error: 'Blocks array is required' },
        { status: 400 }
      )
    }

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Check if we should use LLM (API key available)
    const hasAPIKey = !!(
      process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
    )

    // Generate flashcards
    const flashcards = await generateFlashcards(blocks, count, hasAPIKey)

    return NextResponse.json({
      success: true,
      bookId,
      flashcards,
      count: flashcards.length,
      demo: !hasAPIKey,
    })
  } catch (error) {
    console.error('[Generate Flashcards API] Error:', error)

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
 * GET /api/ai/generate-flashcards
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/generate-flashcards',
    method: 'POST',
    description: 'Generate flashcards for spaced repetition learning',
    body: {
      bookId: 'string',
      blocks: 'ReaderBlock[]',
      count: 'number (optional, default: 20, max: 100)',
    },
    response: {
      success: 'boolean',
      bookId: 'string',
      flashcards: 'Flashcard[]',
      count: 'number',
      demo: 'boolean (true if using mock data)',
    },
    flashcardStructure: {
      id: 'string',
      front: 'string (question)',
      back: 'string (answer)',
      blockId: 'string (optional)',
      tags: 'string[]',
      createdAt: 'number',
      easeFactor: 'number (1.3 - 2.5+)',
      interval: 'number (days until next review)',
      repetitions: 'number',
      nextReview: 'number (timestamp)',
    },
    srsAlgorithm: 'SM-2 (SuperMemo 2) algorithm for spaced repetition',
  })
}
