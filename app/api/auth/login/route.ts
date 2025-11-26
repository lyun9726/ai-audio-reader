/**
 * Login API Route
 * User login with email/password
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserStore } from '@/lib/auth/userStore'
import { getSessionStore } from '@/lib/auth/sessionStore'

/**
 * POST /api/auth/login
 * Login with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body as {
      email: string
      password: string
      rememberMe?: boolean
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const userStore = getUserStore()
    const user = userStore.findByEmail(email)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = userStore.verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session
    const sessionStore = getSessionStore()

    // If rememberMe, extend session to 30 days
    const expiresInMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined

    const session = sessionStore.createSession({
      user,
      expiresInMs,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // Return success with safe user and session
    return NextResponse.json({
      success: true,
      user: userStore.getSafeUser(user),
      session: sessionStore.getSafeSession(session),
      message: 'Login successful',
    })
  } catch (error) {
    console.error('[Login API] Error:', error)

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
 * GET /api/auth/login
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/login',
    method: 'POST',
    description: 'Login with email and password',
    body: {
      email: 'string',
      password: 'string',
      rememberMe: 'boolean (optional, extends session to 30 days)',
    },
    response: {
      success: 'boolean',
      user: {
        id: 'string',
        email: 'string',
        displayName: 'string',
        isAdmin: 'boolean',
        createdAt: 'number',
        updatedAt: 'number',
      },
      session: {
        token: 'string',
        userId: 'string',
        userEmail: 'string',
        createdAt: 'number',
        expiresAt: 'number',
        lastAccessedAt: 'number',
      },
      message: 'string',
    },
    demoAccount: {
      email: 'demo@example.com',
      password: 'demo123',
    },
  })
}
