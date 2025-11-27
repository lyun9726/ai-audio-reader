'use client'

/**
 * AuthProvider Component
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * User type (without password)
 */
export interface User {
  id: string
  email: string
  displayName: string
  isAdmin: boolean
  createdAt: number
  updatedAt: number
}

/**
 * Session type
 */
export interface Session {
  token: string
  userId: string
  userEmail: string
  createdAt: number
  expiresAt: number
  lastAccessedAt: number
}

/**
 * Auth context type
 */
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => Promise<void>
  requestMagicLink: (email: string) => Promise<{ token: string; code: string } | null>
  verifyMagicLink: (token: string, code: string) => Promise<boolean>
  refreshSession: () => Promise<boolean>
}

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * AuthProvider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Save session to localStorage
   */
  const saveSession = useCallback((sessionData: Session) => {
    localStorage.setItem('auth:session', JSON.stringify(sessionData))
    setSession(sessionData)
  }, [])

  /**
   * Clear session from localStorage
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem('auth:session')
    setSession(null)
    setUser(null)
  }, [])

  /**
   * Validate session with API
   */
  const validateSession = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setSession(data.session)
        return true
      }

      return false
    } catch (error) {
      console.error('[Auth] Session validation error:', error)
      return false
    }
  }, [])

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedSession = localStorage.getItem('auth:session')

        if (savedSession) {
          const sessionData: Session = JSON.parse(savedSession)

          // Check if session is expired
          if (Date.now() < sessionData.expiresAt) {
            const isValid = await validateSession(sessionData.token)

            if (!isValid) {
              clearSession()
            }
          } else {
            clearSession()
          }
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error)
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [validateSession, clearSession])

  /**
   * Login with email/password
   */
  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        })

        const data = await response.json()

        if (!data.success) {
          setError(data.error || 'Login failed')
          return false
        }

        setUser(data.user)
        saveSession(data.session)

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [saveSession]
  )

  /**
   * Register new user
   */
  const register = useCallback(
    async (email: string, password: string, displayName: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName }),
        })

        const data = await response.json()

        if (!data.success) {
          setError(data.error || 'Registration failed')
          return false
        }

        setUser(data.user)
        saveSession(data.session)

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [saveSession]
  )

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      if (session) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.token }),
        })
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error)
    } finally {
      clearSession()
      setIsLoading(false)
    }
  }, [session, clearSession])

  /**
   * Request magic link
   */
  const requestMagicLink = useCallback(
    async (email: string): Promise<{ token: string; code: string } | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/auth/magic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!data.success) {
          setError(data.error || 'Magic link request failed')
          return null
        }

        // In demo mode, return the code and token for testing
        return data.demo || null
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * Verify magic link code
   */
  const verifyMagicLink = useCallback(
    async (token: string, code: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/auth/magic', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, code }),
        })

        const data = await response.json()

        if (!data.success) {
          setError(data.error || 'Magic link verification failed')
          return false
        }

        setUser(data.user)
        saveSession(data.session)

        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [saveSession]
  )

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!session) {
      return false
    }

    return await validateSession(session.token)
  }, [session, validateSession])

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    error,
    login,
    register,
    logout,
    requestMagicLink,
    verifyMagicLink,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
