/**
 * Query Memory API Route
 * Queries long-term memory store for cross-chapter Q&A
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryBookMemory } from '@/lib/ai/longMemoryStore'

/**
 * POST /api/ai/query-memory
 * Query memory store with a question
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookId,
      question,
      topK = 5,
    } = body as {
      bookId: string
      question: string
      topK?: number
    }

    // Validate input
    if (!bookId || !question) {
      return NextResponse.json(
        { success: false, error: 'bookId and question are required' },
        { status: 400 }
      )
    }

    // Query memory store
    const results = await queryBookMemory(bookId, question, topK)

    // Format results with source pointers
    const answers = results.map(result => ({
      answer: result.entry.summary,
      content: result.entry.content.substring(0, 200) + '...',
      similarity: result.similarity,
      relevance: result.relevance,
      sources: {
        chapterTitle: result.entry.meta.chapterTitle,
        blockIds: result.entry.meta.blockIds,
      },
    }))

    return NextResponse.json({
      success: true,
      bookId,
      question,
      answers,
      count: answers.length,
    })
  } catch (error) {
    console.error('[Query Memory API] Error:', error)

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
 * GET /api/ai/query-memory
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/query-memory',
    method: 'POST',
    description: 'Query long-term memory for cross-chapter contextual Q&A',
    body: {
      bookId: 'string',
      question: 'string (question to ask)',
      topK: 'number (optional, default: 5, number of results to return)',
    },
    response: {
      success: 'boolean',
      bookId: 'string',
      question: 'string',
      answers: [
        {
          answer: 'string (summary answer)',
          content: 'string (excerpt from source)',
          similarity: 'number (0-1 similarity score)',
          relevance: 'high | medium | low',
          sources: {
            chapterTitle: 'string (optional)',
            blockIds: 'string[] (optional)',
          },
        },
      ],
      count: 'number',
    },
    usage: 'First use /api/ai/remember to build memory, then query it with this endpoint',
  })
}
