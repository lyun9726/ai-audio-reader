/**
 * Register API Route
 * User registration with email/password
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserStore } from '@/lib/auth/userStore'
import { getSessionStore } from '@/lib/auth/sessionStore'

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, displayName } = body as {
      email: string
      password: string
      displayName: string
    }

    // Validate input
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and displayName are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user
    const userStore = getUserStore()

    try {
      const user = userStore.createUser({
        email,
        password,
        displayName,
        isAdmin: false,
      })

      // Create session
      const sessionStore = getSessionStore()
      const session = sessionStore.createSession({
        user,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      // Return success with safe user and session
      return NextResponse.json({
        success: true,
        user: userStore.getSafeUser(user),
        session: sessionStore.getSafeSession(session),
        message: 'User registered successfully',
      })
    } catch (error) {
      // Handle duplicate email
      if (error instanceof Error && error.message === 'Email already exists') {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 409 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('[Register API] Error:', error)

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
 * GET /api/auth/register
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/register',
    method: 'POST',
    description: 'Register a new user account',
    body: {
      email: 'string (valid email format)',
      password: 'string (min 6 characters)',
      displayName: 'string',
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
  })
}
