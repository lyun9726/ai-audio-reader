'use client'

/**
 * Login Page
 * User login with email/password or magic link
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { login, requestMagicLink, verifyMagicLink, error } = useAuth()

  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Magic link state
  const [magicToken, setMagicToken] = useState<string | null>(null)
  const [magicCode, setMagicCode] = useState('')
  const [demoCode, setDemoCode] = useState<string | null>(null)

  /**
   * Handle password login
   */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLocalError(null)

    const success = await login(email, password, rememberMe)

    if (success) {
      router.push('/reader')
    } else {
      setLocalError(error || 'Login failed')
    }

    setIsLoading(false)
  }

  /**
   * Handle magic link request
   */
  const handleMagicRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLocalError(null)

    const result = await requestMagicLink(email)

    if (result) {
      setMagicToken(result.token)
      setDemoCode(result.code)
      setLocalError(null)
    } else {
      setLocalError(error || 'Failed to send magic link')
    }

    setIsLoading(false)
  }

  /**
   * Handle magic link verification
   */
  const handleMagicVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!magicToken) {
      setLocalError('No magic link token')
      return
    }

    setIsLoading(true)
    setLocalError(null)

    const success = await verifyMagicLink(magicToken, magicCode)

    if (success) {
      router.push('/reader')
    } else {
      setLocalError(error || 'Invalid code')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center">AI Audio Reader</h2>
          <p className="mt-2 text-center text-gray-600">Sign in to your account</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setMode('password')}
            className={`pb-2 px-4 ${
              mode === 'password'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`pb-2 px-4 ${
              mode === 'magic'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {localError}
          </div>
        )}

        {/* Password Login */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="demo@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="demo123"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me (30 days)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* Magic Link Login */}
        {mode === 'magic' && !magicToken && (
          <form onSubmit={handleMagicRequest} className="space-y-6">
            <div>
              <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="magic-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        {/* Magic Link Verification */}
        {mode === 'magic' && magicToken && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <p className="text-sm text-blue-700">
                Magic link sent! Check your email for the code.
              </p>
              {demoCode && (
                <p className="mt-2 text-xs text-blue-600">
                  Demo mode - Your code: <strong>{demoCode}</strong>
                </p>
              )}
            </div>

            <form onSubmit={handleMagicVerify} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={magicCode}
                  onChange={(e) => setMagicCode(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMagicToken(null)
                  setMagicCode('')
                  setDemoCode(null)
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Use a different email
              </button>
            </form>
          </div>
        )}

        {/* Demo Account Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo account:</p>
          <p>
            <strong>demo@example.com</strong> / <strong>demo123</strong>
          </p>
          <p className="mt-2">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
