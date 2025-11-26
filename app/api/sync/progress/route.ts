/**
 * Sync Progress API Route
 * Save and retrieve reading progress across devices
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/auth/sessionStore'
import { getSyncStore, type ReadingProgress } from '@/lib/sync/syncStore'

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
 * POST /api/sync/progress
 * Save reading progress
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
    const { bookId, currentBlock, scrollPosition, deviceId } = body as {
      bookId: string
      currentBlock: number
      scrollPosition: number
      deviceId: string
    }

    // Validate input
    if (!bookId || currentBlock === undefined || scrollPosition === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'bookId, currentBlock, and scrollPosition are required',
        },
        { status: 400 }
      )
    }

    // Create progress object
    const progress: ReadingProgress = {
      userId,
      bookId,
      currentBlock,
      scrollPosition,
      timestamp: Date.now(),
      deviceId: deviceId || 'unknown',
    }

    // Save progress
    const syncStore = getSyncStore()
    const saved = syncStore.saveProgress(progress)

    return NextResponse.json({
      success: true,
      progress: saved,
      message: 'Progress saved',
    })
  } catch (error) {
    console.error('[Sync Progress POST] Error:', error)

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
 * GET /api/sync/progress?bookId=xxx
 * Get reading progress for a book
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

    if (!bookId) {
      // Return all progress for user
      const syncStore = getSyncStore()
      const allProgress = syncStore.getUserProgress(userId)

      return NextResponse.json({
        success: true,
        progress: allProgress,
        count: allProgress.length,
      })
    }

    // Get progress for specific book
    const syncStore = getSyncStore()
    const progress = syncStore.getProgress(userId, bookId)

    if (!progress) {
      return NextResponse.json({
        success: true,
        progress: null,
        message: 'No progress found for this book',
      })
    }

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error('[Sync Progress GET] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
