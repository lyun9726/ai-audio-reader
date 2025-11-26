/**
 * Sync Summaries API Route
 * Save and retrieve AI-generated summaries across devices
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/auth/sessionStore'
import { getSyncStore, type UserSummary } from '@/lib/sync/syncStore'
import crypto from 'crypto'

/**
 * Authenticate request and get user ID
 */
function authenticateRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  const sessionStore = getSessionStore()
  const session = sessionStore.validateSession(token)

  return session?.userId || null
}

/**
 * POST /api/sync/summaries
 * Save a summary
 */
export async function POST(request: NextRequest) {
  try {
    const userId = authenticateRequest(request)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookId, content, level, deviceId } = body as {
      bookId: string
      content: string
      level: string
      deviceId: string
    }

    // Validate input
    if (!bookId || !content || !level) {
      return NextResponse.json(
        { success: false, error: 'bookId, content, and level are required' },
        { status: 400 }
      )
    }

    // Create summary object
    const now = Date.now()
    const summary: UserSummary = {
      id: `summary-${userId}-${now}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      bookId,
      content,
      level,
      createdAt: now,
      updatedAt: now,
      deviceId: deviceId || 'unknown',
    }

    // Save summary
    const syncStore = getSyncStore()
    const saved = syncStore.saveSummary(summary)

    return NextResponse.json({
      success: true,
      summary: saved,
      message: 'Summary saved',
    })
  } catch (error) {
    console.error('[Sync Summaries POST] Error:', error)

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
 * GET /api/sync/summaries?bookId=xxx
 * Get summaries for a book or all summaries
 */
export async function GET(request: NextRequest) {
  try {
    const userId = authenticateRequest(request)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    const syncStore = getSyncStore()

    if (!bookId) {
      // Return all summaries for user
      const allSummaries = syncStore.getUserSummaries(userId)

      return NextResponse.json({
        success: true,
        summaries: allSummaries,
        count: allSummaries.length,
      })
    }

    // Get summaries for specific book
    const summaries = syncStore.getBookSummaries(userId, bookId)

    return NextResponse.json({
      success: true,
      summaries,
      count: summaries.length,
    })
  } catch (error) {
    console.error('[Sync Summaries GET] Error:', error)

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
 * DELETE /api/sync/summaries?summaryId=xxx
 * Delete summary
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = authenticateRequest(request)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const summaryId = searchParams.get('summaryId')

    if (!summaryId) {
      return NextResponse.json(
        { success: false, error: 'summaryId is required' },
        { status: 400 }
      )
    }

    const syncStore = getSyncStore()

    // Check if summary exists and belongs to user
    const summary = syncStore.getSummary(summaryId)

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Summary not found' },
        { status: 404 }
      )
    }

    if (summary.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete summary
    const deleted = syncStore.deleteSummary(summaryId)

    return NextResponse.json({
      success: true,
      deleted,
      message: 'Summary deleted',
    })
  } catch (error) {
    console.error('[Sync Summaries DELETE] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
