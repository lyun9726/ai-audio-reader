/**
 * Generate Study Plan API Route
 * Creates day-by-day reading plans
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateStudyPlan } from '@/lib/ai/planGenerator'
import type { ReaderBlock } from '@/lib/types'

/**
 * POST /api/ai/generate-plan
 * Generate study plan from blocks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookId,
      blocks,
      days = 7,
    } = body as {
      bookId: string
      blocks: ReaderBlock[]
      days?: number
    }

    // Validate input
    if (!bookId || !blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { success: false, error: 'bookId and blocks array are required' },
        { status: 400 }
      )
    }

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, error: 'Days must be between 1 and 365' },
        { status: 400 }
      )
    }

    // Check if we should use LLM (API key available)
    const hasAPIKey = !!(
      process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
    )

    // Generate study plan
    const plan = await generateStudyPlan(bookId, blocks, days, hasAPIKey)

    return NextResponse.json({
      success: true,
      plan,
      demo: !hasAPIKey,
    })
  } catch (error) {
    console.error('[Generate Plan API] Error:', error)

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
 * GET /api/ai/generate-plan
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/generate-plan',
    method: 'POST',
    description: 'Generate day-by-day study plan with goals and checkpoints',
    body: {
      bookId: 'string',
      blocks: 'ReaderBlock[]',
      days: 'number (optional, default: 7, max: 365)',
    },
    response: {
      success: 'boolean',
      plan: {
        id: 'string',
        bookId: 'string',
        totalDays: 'number',
        startDate: 'string (YYYY-MM-DD)',
        endDate: 'string (YYYY-MM-DD)',
        days: 'StudyDay[]',
        totalBlocks: 'number',
        totalMinutes: 'number',
        createdAt: 'number',
      },
      demo: 'boolean (true if using mock data)',
    },
    studyDayStructure: {
      day: 'number',
      date: 'string (YYYY-MM-DD)',
      title: 'string',
      goals: 'string[]',
      blocks: 'number[] (block indices)',
      estimatedMinutes: 'number',
      checkpoints: 'string[]',
      completed: 'boolean',
      completedAt: 'number (optional)',
    },
  })
}
