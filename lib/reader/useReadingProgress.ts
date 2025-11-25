'use client'

import { useEffect, useCallback } from 'react'

interface ReadingProgress {
  index: number
  scrollY?: number
  timestamp: number
}

const STORAGE_KEY_PREFIX = 'reader:progress:'

/**
 * Load reading progress from localStorage
 */
export function loadProgress(bookId: string): ReadingProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const key = STORAGE_KEY_PREFIX + bookId
    const data = localStorage.getItem(key)
    if (!data) return null

    const progress = JSON.parse(data) as ReadingProgress
    return progress
  } catch (e) {
    console.warn('[Reading Progress] Failed to load:', e)
    return null
  }
}

/**
 * Save reading progress to localStorage
 */
export function saveProgress(
  bookId: string,
  index: number,
  scrollY?: number
): void {
  if (typeof window === 'undefined') return

  try {
    const key = STORAGE_KEY_PREFIX + bookId
    const progress: ReadingProgress = {
      index,
      scrollY,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(progress))
  } catch (e) {
    console.warn('[Reading Progress] Failed to save:', e)
  }
}

/**
 * Clear reading progress for a book
 */
export function clearProgress(bookId: string): void {
  if (typeof window === 'undefined') return

  try {
    const key = STORAGE_KEY_PREFIX + bookId
    localStorage.removeItem(key)
  } catch (e) {
    console.warn('[Reading Progress] Failed to clear:', e)
  }
}

/**
 * Hook for managing reading progress
 */
export function useReadingProgress(bookId: string) {
  // Load progress on mount
  const getProgress = useCallback(() => {
    return loadProgress(bookId)
  }, [bookId])

  // Save progress
  const updateProgress = useCallback(
    (index: number, scrollY?: number) => {
      saveProgress(bookId, index, scrollY)
    },
    [bookId]
  )

  // Clear progress
  const removeProgress = useCallback(() => {
    clearProgress(bookId)
  }, [bookId])

  return {
    getProgress,
    updateProgress,
    removeProgress,
  }
}

/**
 * Auto-save progress on scroll
 */
export function useAutoSaveProgress(
  bookId: string,
  currentIndex: number,
  throttleMs: number = 2000
) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeout: NodeJS.Timeout | null = null

    const handleScroll = () => {
      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        const scrollY = window.scrollY
        saveProgress(bookId, currentIndex, scrollY)
      }, throttleMs)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeout) clearTimeout(timeout)
    }
  }, [bookId, currentIndex, throttleMs])
}
