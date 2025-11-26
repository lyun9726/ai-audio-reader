/**
 * Remember API Route
 * Saves book content to long-term memory store
 */

import { NextRequest, NextResponse } from 'next/server'
import { rememberBook } from '@/lib/ai/longMemoryStore'

/**
 * POST /api/ai/remember
 * Save book content to memory
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookId,
      content,
      summary,
      meta,
    } = body as {
      bookId: string
      content: string
      summary: string
      meta?: {
        chapterTitle?: string
        blockIds?: string[]
        importance?: number
      }
    }

    // Validate input
    if (!bookId || !content) {
      return NextResponse.json(
        { success: false, error: 'bookId and content are required' },
        { status: 400 }
      )
    }

    // Save to memory store
    const entry = await rememberBook(bookId, content, summary, meta)

    return NextResponse.json({
      success: true,
      entry: {
        id: entry.id,
        bookId: entry.bookId,
        summary: entry.summary,
        createdAt: entry.meta.createdAt,
      },
      message: 'Content saved to memory store',
    })
  } catch (error) {
    console.error('[Remember API] Error:', error)

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
 * GET /api/ai/remember
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/remember',
    method: 'POST',
    description: 'Save book content to long-term memory store for cross-chapter Q&A',
    body: {
      bookId: 'string',
      content: 'string (text content to remember)',
      summary: 'string (brief summary of content)',
      meta: {
        chapterTitle: 'string (optional)',
        blockIds: 'string[] (optional)',
        importance: 'number (optional, 0-1)',
      },
    },
    response: {
      success: 'boolean',
      entry: {
        id: 'string',
        bookId: 'string',
        summary: 'string',
        createdAt: 'number',
      },
      message: 'string',
    },
    usage: 'Use this endpoint to build up contextual memory before querying with /api/ai/query-memory',
  })
}
