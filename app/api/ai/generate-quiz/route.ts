/**
 * Generate Quiz API Route
 * Creates quiz questions from content
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateQuiz, type QuizType } from '@/lib/ai/quizGenerator'
import type { ReaderBlock } from '@/lib/types'

/**
 * POST /api/ai/generate-quiz
 * Generate quiz from blocks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookId,
      blocks,
      quizType = 'mcq',
      count = 10,
    } = body as {
      bookId: string
      blocks: ReaderBlock[]
      quizType?: QuizType
      count?: number
    }

    // Validate input
    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { success: false, error: 'Blocks array is required' },
        { status: 400 }
      )
    }

    if (count < 1 || count > 50) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Check if we should use LLM (API key available)
    const hasAPIKey = !!(
      process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
    )

    // Generate quiz
    const quiz = await generateQuiz(blocks, quizType, count, hasAPIKey)

    return NextResponse.json({
      success: true,
      bookId,
      quizType,
      items: quiz,
      count: quiz.length,
      demo: !hasAPIKey,
    })
  } catch (error) {
    console.error('[Generate Quiz API] Error:', error)

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
 * GET /api/ai/generate-quiz
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/generate-quiz',
    method: 'POST',
    description: 'Generate quiz questions from content',
    body: {
      bookId: 'string',
      blocks: 'ReaderBlock[]',
      quizType: 'mcq | cloze | shortAnswer (optional, default: mcq)',
      count: 'number (optional, default: 10, max: 50)',
    },
    quizTypes: {
      mcq: 'Multiple choice questions with 4 options',
      cloze: 'Fill-in-the-blank questions',
      shortAnswer: 'Short answer questions requiring explanation',
    },
    response: {
      success: 'boolean',
      bookId: 'string',
      quizType: 'string',
      items: 'QuizItem[]',
      count: 'number',
      demo: 'boolean (true if using mock data)',
    },
    itemStructure: {
      id: 'string',
      type: 'QuizType',
      question: 'string',
      options: 'string[] (for MCQ only)',
      answer: 'string',
      explanation: 'string',
      difficulty: 'easy | medium | hard',
      blockId: 'string (optional)',
    },
  })
}
