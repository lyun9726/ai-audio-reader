'use client'

import { useState, useEffect } from 'react'

export type ReadingMode = 'light' | 'dark' | 'focus'

interface ReadingModeToggleProps {
  mode: ReadingMode
  onChange: (mode: ReadingMode) => void
}

export function ReadingModeToggle({ mode, onChange }: ReadingModeToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <button
        onClick={() => onChange('light')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'light'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      <button
        onClick={() => onChange('dark')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'dark'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>

      <button
        onClick={() => onChange('focus')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'focus'
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    </div>
  )
}

/**
 * Hook for managing reading mode with localStorage persistence
 */
export function useReadingMode() {
  const [mode, setMode] = useState<ReadingMode>('light')

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('reader:mode') as ReadingMode | null
      if (saved && ['light', 'dark', 'focus'].includes(saved)) {
        setMode(saved)
      }
    } catch (e) {
      console.warn('[Reading Mode] Failed to load:', e)
    }
  }, [])

  const updateMode = (newMode: ReadingMode) => {
    setMode(newMode)

    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('reader:mode', newMode)
    } catch (e) {
      console.warn('[Reading Mode] Failed to save:', e)
    }
  }

  return { mode, setMode: updateMode }
}
