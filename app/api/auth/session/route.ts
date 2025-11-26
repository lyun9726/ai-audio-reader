/**
 * Session API Route
 * Validate and manage user sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/auth/sessionStore'
import { getUserStore } from '@/lib/auth/userStore'

/**
 * GET /api/auth/session
 * Validate session and return user data
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 401 }
      )
    }

    // Validate session
    const sessionStore = getSessionStore()
    const session = sessionStore.validateSession(token)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Get user data
    const userStore = getUserStore()
    const user = userStore.findById(session.userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user and session
    return NextResponse.json({
      success: true,
      user: userStore.getSafeUser(user),
      session: sessionStore.getSafeSession(session),
    })
  } catch (error) {
    console.error('[Session API] Error:', error)

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
 * PUT /api/auth/session
 * Extend session expiry
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { expiresInMs } = body as { expiresInMs?: number }

    // Extend session
    const sessionStore = getSessionStore()
    const session = sessionStore.extendSession(token, expiresInMs)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: sessionStore.getSafeSession(session),
      message: 'Session extended',
    })
  } catch (error) {
    console.error('[Session API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
