/**
 * Magic Link API Route
 * Passwordless authentication via email link
 * TODO: Integrate with email service (SendGrid/Resend) in production
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getUserStore } from '@/lib/auth/userStore'
import { getSessionStore } from '@/lib/auth/sessionStore'

/**
 * In-memory magic link store (demo mode)
 * TODO: Replace with Redis in production
 */
const magicLinks = new Map<
  string,
  { email: string; code: string; expiresAt: number }
>()

/**
 * POST /api/auth/magic/request
 * Request magic link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body as { email: string }

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
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

    // Check if user exists
    const userStore = getUserStore()
    const user = userStore.findByEmail(email)

    if (!user) {
      // For security, don't reveal if user exists
      // But in demo mode, create user automatically
      try {
        const newUser = userStore.createUser({
          email,
          password: crypto.randomBytes(32).toString('hex'), // Random password
          displayName: email.split('@')[0],
          isAdmin: false,
        })
        console.log('[Magic Link] Auto-created user:', newUser.email)
      } catch (error) {
        // User might already exist, ignore error
      }
    }

    // Generate magic code (6 digits for demo)
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')

    // Store magic link (expires in 15 minutes)
    const expiresAt = Date.now() + 15 * 60 * 1000
    magicLinks.set(token, { email, code, expiresAt })

    // TODO: Send email with magic link
    // For demo, just log the code
    console.log('[Magic Link] Code for', email, ':', code)
    console.log('[Magic Link] Token:', token)

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to email',
      // In demo mode, return the code for testing
      demo: {
        code,
        token,
        expiresIn: '15 minutes',
      },
    })
  } catch (error) {
    console.error('[Magic Link Request API] Error:', error)

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
 * PUT /api/auth/magic/verify
 * Verify magic code and create session
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, code } = body as { token: string; code: string }

    // Validate input
    if (!token || !code) {
      return NextResponse.json(
        { success: false, error: 'Token and code are required' },
        { status: 400 }
      )
    }

    // Check magic link
    const magicLink = magicLinks.get(token)

    if (!magicLink) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired magic link' },
        { status: 401 }
      )
    }

    // Check expiry
    if (Date.now() > magicLink.expiresAt) {
      magicLinks.delete(token)
      return NextResponse.json(
        { success: false, error: 'Magic link expired' },
        { status: 401 }
      )
    }

    // Verify code
    if (magicLink.code !== code) {
      return NextResponse.json(
        { success: false, error: 'Invalid code' },
        { status: 401 }
      )
    }

    // Find user
    const userStore = getUserStore()
    const user = userStore.findByEmail(magicLink.email)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete used magic link
    magicLinks.delete(token)

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
      message: 'Magic link verified',
    })
  } catch (error) {
    console.error('[Magic Link Verify API] Error:', error)

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
 * GET /api/auth/magic
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/magic',
    methods: {
      POST: {
        path: '/api/auth/magic (request)',
        description: 'Request magic link via email',
        body: {
          email: 'string',
        },
        response: {
          success: 'boolean',
          message: 'string',
          demo: {
            code: 'string (6-digit code for testing)',
            token: 'string (magic link token)',
            expiresIn: 'string',
          },
        },
      },
      PUT: {
        path: '/api/auth/magic (verify)',
        description: 'Verify magic code and login',
        body: {
          token: 'string (from request response)',
          code: 'string (6-digit code from email)',
        },
        response: {
          success: 'boolean',
          user: 'User object',
          session: 'Session object',
          message: 'string',
        },
      },
    },
    note: 'In demo mode, user is auto-created if not exists. Code is logged to console.',
  })
}
