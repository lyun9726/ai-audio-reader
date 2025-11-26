/**
 * Sync Flashcards API Route
 * Save and retrieve flashcard progress across devices (SRS data)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/auth/sessionStore'
import { getSyncStore, type FlashcardProgress } from '@/lib/sync/syncStore'

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
 * POST /api/sync/flashcards
 * Save flashcard progress (after review)
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
    const {
      bookId,
      flashcardId,
      easeFactor,
      interval,
      repetitions,
      nextReview,
      lastReview,
      deviceId,
    } = body as {
      bookId: string
      flashcardId: string
      easeFactor: number
      interval: number
      repetitions: number
      nextReview: number
      lastReview: number
      deviceId: string
    }

    // Validate input
    if (
      !bookId ||
      !flashcardId ||
      easeFactor === undefined ||
      interval === undefined ||
      repetitions === undefined ||
      nextReview === undefined ||
      lastReview === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'bookId, flashcardId, easeFactor, interval, repetitions, nextReview, and lastReview are required',
        },
        { status: 400 }
      )
    }

    // Create progress object
    const progress: FlashcardProgress = {
      userId,
      bookId,
      flashcardId,
      easeFactor,
      interval,
      repetitions,
      nextReview,
      lastReview,
      deviceId: deviceId || 'unknown',
    }

    // Save progress
    const syncStore = getSyncStore()
    const saved = syncStore.saveFlashcardProgress(progress)

    return NextResponse.json({
      success: true,
      progress: saved,
      message: 'Flashcard progress saved',
    })
  } catch (error) {
    console.error('[Sync Flashcards POST] Error:', error)

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
 * GET /api/sync/flashcards?bookId=xxx&flashcardId=xxx&due=true
 * Get flashcard progress
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
    const flashcardId = searchParams.get('flashcardId')
    const due = searchParams.get('due') === 'true'

    const syncStore = getSyncStore()

    // Get specific flashcard progress
    if (bookId && flashcardId) {
      const progress = syncStore.getFlashcardProgress(userId, bookId, flashcardId)

      if (!progress) {
        return NextResponse.json({
          success: true,
          progress: null,
          message: 'No progress found for this flashcard',
        })
      }

      return NextResponse.json({
        success: true,
        progress,
      })
    }

    // Get all flashcard progress for a book
    if (bookId) {
      if (due) {
        // Get only due flashcards
        const dueFlashcards = syncStore.getDueFlashcards(userId, bookId)

        return NextResponse.json({
          success: true,
          flashcards: dueFlashcards,
          count: dueFlashcards.length,
          due: true,
        })
      }

      // Get all flashcard progress for book
      const allProgress = syncStore.getBookFlashcardProgress(userId, bookId)

      return NextResponse.json({
        success: true,
        flashcards: allProgress,
        count: allProgress.length,
      })
    }

    // Invalid request
    return NextResponse.json(
      { success: false, error: 'bookId is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Sync Flashcards GET] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
