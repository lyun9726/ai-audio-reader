/**
 * Logout API Route
 * User logout - deletes session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionStore } from '@/lib/auth/sessionStore'

/**
 * POST /api/auth/logout
 * Logout and delete session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body as { token?: string }

    // Get token from body or Authorization header
    const sessionToken =
      token || request.headers.get('authorization')?.replace('Bearer ', '')

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 400 }
      )
    }

    // Delete session
    const sessionStore = getSessionStore()
    const deleted = sessionStore.deleteSession(sessionToken)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Session not found or already expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('[Logout API] Error:', error)

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
 * GET /api/auth/logout
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/logout',
    method: 'POST',
    description: 'Logout and delete session',
    body: {
      token: 'string (session token, or use Authorization header)',
    },
    headers: {
      Authorization: 'Bearer <session_token> (alternative to body.token)',
    },
    response: {
      success: 'boolean',
      message: 'string',
    },
  })
}
