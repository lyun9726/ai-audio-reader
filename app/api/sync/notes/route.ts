/**
 * Sync Notes API Route
 * Save and retrieve notes/highlights across devices
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/auth/sessionStore'
import { getSyncStore, type Note } from '@/lib/sync/syncStore'
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
 * POST /api/sync/notes
 * Create new note or highlight
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
    const { bookId, blockIndex, content, type, color, deviceId } = body as {
      bookId: string
      blockIndex: number
      content: string
      type: 'note' | 'highlight'
      color?: string
      deviceId: string
    }

    // Validate input
    if (!bookId || blockIndex === undefined || !content || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'bookId, blockIndex, content, and type are required',
        },
        { status: 400 }
      )
    }

    // Validate type
    if (type !== 'note' && type !== 'highlight') {
      return NextResponse.json(
        { success: false, error: 'type must be "note" or "highlight"' },
        { status: 400 }
      )
    }

    // Create note object
    const now = Date.now()
    const note: Note = {
      id: `note-${userId}-${now}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      bookId,
      blockIndex,
      content,
      type,
      color,
      createdAt: now,
      updatedAt: now,
      deviceId: deviceId || 'unknown',
    }

    // Save note
    const syncStore = getSyncStore()
    const saved = syncStore.saveNote(note)

    return NextResponse.json({
      success: true,
      note: saved,
      message: 'Note saved',
    })
  } catch (error) {
    console.error('[Sync Notes POST] Error:', error)

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
 * GET /api/sync/notes?bookId=xxx
 * Get notes for a book or all notes
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
      // Return all notes for user
      const allNotes = syncStore.getUserNotes(userId)

      return NextResponse.json({
        success: true,
        notes: allNotes,
        count: allNotes.length,
      })
    }

    // Get notes for specific book
    const notes = syncStore.getBookNotes(userId, bookId)

    return NextResponse.json({
      success: true,
      notes,
      count: notes.length,
    })
  } catch (error) {
    console.error('[Sync Notes GET] Error:', error)

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
 * PUT /api/sync/notes
 * Update existing note
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = authenticateRequest(request)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { noteId, content } = body as {
      noteId: string
      content: string
    }

    // Validate input
    if (!noteId || !content) {
      return NextResponse.json(
        { success: false, error: 'noteId and content are required' },
        { status: 400 }
      )
    }

    const syncStore = getSyncStore()

    // Check if note exists and belongs to user
    const existingNote = syncStore.getNote(noteId)

    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    if (existingNote.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update note
    const updated = syncStore.updateNote(noteId, content)

    return NextResponse.json({
      success: true,
      note: updated,
      message: 'Note updated',
    })
  } catch (error) {
    console.error('[Sync Notes PUT] Error:', error)

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
 * DELETE /api/sync/notes?noteId=xxx
 * Delete note
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
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'noteId is required' },
        { status: 400 }
      )
    }

    const syncStore = getSyncStore()

    // Check if note exists and belongs to user
    const note = syncStore.getNote(noteId)

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      )
    }

    if (note.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete note
    const deleted = syncStore.deleteNote(noteId)

    return NextResponse.json({
      success: true,
      deleted,
      message: 'Note deleted',
    })
  } catch (error) {
    console.error('[Sync Notes DELETE] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
