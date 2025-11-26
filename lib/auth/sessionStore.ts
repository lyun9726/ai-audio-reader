/**
 * Session Store
 * In-memory session management for demo mode
 * TODO: Replace with Redis/database sessions in production
 */

import crypto from 'crypto'
import type { User } from './userStore'

/**
 * Session structure
 */
export interface Session {
  token: string
  userId: string
  userEmail: string
  createdAt: number
  expiresAt: number
  lastAccessedAt: number
  ipAddress?: string
  userAgent?: string
}

/**
 * Session creation input
 */
export interface CreateSessionInput {
  user: User
  expiresInMs?: number
  ipAddress?: string
  userAgent?: string
}

/**
 * Session store class
 */
class SessionStore {
  private sessions: Map<string, Session> = new Map()
  private userSessions: Map<string, Set<string>> = new Map()

  // Default session expiry: 7 days
  private readonly DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

  /**
   * Generate secure session token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Create new session
   */
  createSession(input: CreateSessionInput): Session {
    const { user, expiresInMs, ipAddress, userAgent } = input

    const token = this.generateToken()
    const now = Date.now()
    const expiresAt = now + (expiresInMs || this.DEFAULT_EXPIRY_MS)

    const session: Session = {
      token,
      userId: user.id,
      userEmail: user.email,
      createdAt: now,
      expiresAt,
      lastAccessedAt: now,
      ipAddress,
      userAgent,
    }

    // Store session
    this.sessions.set(token, session)

    // Track user sessions
    if (!this.userSessions.has(user.id)) {
      this.userSessions.set(user.id, new Set())
    }
    this.userSessions.get(user.id)!.add(token)

    return session
  }

  /**
   * Get session by token
   */
  getSession(token: string): Session | null {
    const session = this.sessions.get(token)

    if (!session) {
      return null
    }

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      this.deleteSession(token)
      return null
    }

    // Update last accessed time
    session.lastAccessedAt = Date.now()

    return session
  }

  /**
   * Validate session and return session if valid
   */
  validateSession(token: string): Session | null {
    return this.getSession(token)
  }

  /**
   * Delete session by token
   */
  deleteSession(token: string): boolean {
    const session = this.sessions.get(token)

    if (!session) {
      return false
    }

    // Remove from sessions map
    this.sessions.delete(token)

    // Remove from user sessions
    const userTokens = this.userSessions.get(session.userId)
    if (userTokens) {
      userTokens.delete(token)
      if (userTokens.size === 0) {
        this.userSessions.delete(session.userId)
      }
    }

    return true
  }

  /**
   * Delete all sessions for a user
   */
  deleteUserSessions(userId: string): number {
    const userTokens = this.userSessions.get(userId)

    if (!userTokens) {
      return 0
    }

    const count = userTokens.size

    // Delete all sessions
    for (const token of userTokens) {
      this.sessions.delete(token)
    }

    // Clear user session set
    this.userSessions.delete(userId)

    return count
  }

  /**
   * Extend session expiry
   */
  extendSession(token: string, expiresInMs?: number): Session | null {
    const session = this.getSession(token)

    if (!session) {
      return null
    }

    session.expiresAt = Date.now() + (expiresInMs || this.DEFAULT_EXPIRY_MS)
    session.lastAccessedAt = Date.now()

    return session
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): Session[] {
    const userTokens = this.userSessions.get(userId)

    if (!userTokens) {
      return []
    }

    const sessions: Session[] = []

    for (const token of userTokens) {
      const session = this.getSession(token)
      if (session) {
        sessions.push(session)
      }
    }

    return sessions
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = Date.now()
    let count = 0

    for (const [token, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.deleteSession(token)
        count++
      }
    }

    return count
  }

  /**
   * Get total session count
   */
  getSessionCount(): number {
    return this.sessions.size
  }

  /**
   * Get total user count with active sessions
   */
  getActiveUserCount(): number {
    return this.userSessions.size
  }

  /**
   * Get session without sensitive data (for client)
   */
  getSafeSession(session: Session): Omit<Session, 'ipAddress' | 'userAgent'> {
    const { ipAddress, userAgent, ...safeSession } = session
    return safeSession
  }
}

// Global instance
let sessionStore: SessionStore | null = null

/**
 * Get or create session store instance
 */
export function getSessionStore(): SessionStore {
  if (!sessionStore) {
    sessionStore = new SessionStore()

    // Start cleanup interval (every hour)
    if (typeof setInterval !== 'undefined') {
      setInterval(
        () => {
          const cleaned = sessionStore!.cleanupExpiredSessions()
          if (cleaned > 0) {
            console.log(`[SessionStore] Cleaned up ${cleaned} expired sessions`)
          }
        },
        60 * 60 * 1000
      )
    }
  }

  return sessionStore
}

/**
 * Reset session store (for testing)
 */
export function resetSessionStore(): void {
  sessionStore = null
}
