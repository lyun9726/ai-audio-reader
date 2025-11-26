'use client'

/**
 * useCloudSync Hook
 * Multi-device synchronization for reading progress, notes, and more
 */

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

/**
 * Reading progress type
 */
export interface ReadingProgress {
  userId: string
  bookId: string
  currentBlock: number
  scrollPosition: number
  timestamp: number
  deviceId: string
}

/**
 * Note/Highlight type
 */
export interface Note {
  id: string
  userId: string
  bookId: string
  blockIndex: number
  content: string
  type: 'note' | 'highlight'
  color?: string
  createdAt: number
  updatedAt: number
  deviceId: string
}

/**
 * User summary type
 */
export interface UserSummary {
  id: string
  userId: string
  bookId: string
  content: string
  level: string
  createdAt: number
  updatedAt: number
  deviceId: string
}

/**
 * Flashcard progress type
 */
export interface FlashcardProgress {
  userId: string
  bookId: string
  flashcardId: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: number
  lastReview: number
  deviceId: string
}

/**
 * Cloud sync state
 */
export interface CloudSyncState {
  isLoading: boolean
  error: string | null
  lastSync: number | null
  deviceId: string
}

/**
 * Hook return type
 */
export interface UseCloudSyncReturn {
  state: CloudSyncState

  // Progress
  saveProgress: (
    bookId: string,
    currentBlock: number,
    scrollPosition: number
  ) => Promise<boolean>
  getProgress: (bookId: string) => Promise<ReadingProgress | null>
  getAllProgress: () => Promise<ReadingProgress[]>

  // Notes
  saveNote: (
    bookId: string,
    blockIndex: number,
    content: string,
    type: 'note' | 'highlight',
    color?: string
  ) => Promise<Note | null>
  getNotes: (bookId: string) => Promise<Note[]>
  updateNote: (noteId: string, content: string) => Promise<Note | null>
  deleteNote: (noteId: string) => Promise<boolean>

  // Summaries
  saveSummary: (bookId: string, content: string, level: string) => Promise<UserSummary | null>
  getSummaries: (bookId: string) => Promise<UserSummary[]>
  deleteSummary: (summaryId: string) => Promise<boolean>

  // Flashcards
  saveFlashcardProgress: (
    bookId: string,
    flashcardId: string,
    easeFactor: number,
    interval: number,
    repetitions: number,
    nextReview: number,
    lastReview: number
  ) => Promise<boolean>
  getFlashcardProgress: (bookId: string, flashcardId: string) => Promise<FlashcardProgress | null>
  getDueFlashcards: (bookId: string) => Promise<FlashcardProgress[]>
}

/**
 * Get or create device ID
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server'
  }

  let deviceId = localStorage.getItem('device:id')

  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(7)}`
    localStorage.setItem('device:id', deviceId)
  }

  return deviceId
}

/**
 * useCloudSync hook
 */
export function useCloudSync(): UseCloudSyncReturn {
  const { session } = useAuth()

  const [state, setState] = useState<CloudSyncState>({
    isLoading: false,
    error: null,
    lastSync: null,
    deviceId: getDeviceId(),
  })

  /**
   * Make authenticated API request
   */
  const apiRequest = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<Response | null> => {
      if (!session) {
        setState((prev) => ({ ...prev, error: 'Not authenticated' }))
        return null
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
        ...options.headers,
      }

      try {
        const response = await fetch(endpoint, {
          ...options,
          headers,
        })

        setState((prev) => ({ ...prev, lastSync: Date.now() }))

        return response
      } catch (error) {
        console.error('[CloudSync] API request error:', error)
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
        return null
      }
    },
    [session]
  )

  // ============================================
  // READING PROGRESS
  // ============================================

  const saveProgress = useCallback(
    async (bookId: string, currentBlock: number, scrollPosition: number): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest('/api/sync/progress', {
        method: 'POST',
        body: JSON.stringify({
          bookId,
          currentBlock,
          scrollPosition,
          deviceId: state.deviceId,
        }),
      })

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return false
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.success
    },
    [apiRequest, state.deviceId]
  )

  const getProgress = useCallback(
    async (bookId: string): Promise<ReadingProgress | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest(`/api/sync/progress?bookId=${bookId}`)

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return null
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.progress || null
    },
    [apiRequest]
  )

  const getAllProgress = useCallback(async (): Promise<ReadingProgress[]> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const response = await apiRequest('/api/sync/progress')

    if (!response || !response.ok) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return []
    }

    const data = await response.json()
    setState((prev) => ({ ...prev, isLoading: false }))

    return data.progress || []
  }, [apiRequest])

  // ============================================
  // NOTES
  // ============================================

  const saveNote = useCallback(
    async (
      bookId: string,
      blockIndex: number,
      content: string,
      type: 'note' | 'highlight',
      color?: string
    ): Promise<Note | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest('/api/sync/notes', {
        method: 'POST',
        body: JSON.stringify({
          bookId,
          blockIndex,
          content,
          type,
          color,
          deviceId: state.deviceId,
        }),
      })

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return null
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.note || null
    },
    [apiRequest, state.deviceId]
  )

  const getNotes = useCallback(
    async (bookId: string): Promise<Note[]> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest(`/api/sync/notes?bookId=${bookId}`)

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return []
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.notes || []
    },
    [apiRequest]
  )

  const updateNote = useCallback(
    async (noteId: string, content: string): Promise<Note | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest('/api/sync/notes', {
        method: 'PUT',
        body: JSON.stringify({ noteId, content }),
      })

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return null
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.note || null
    },
    [apiRequest]
  )

  const deleteNote = useCallback(
    async (noteId: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest(`/api/sync/notes?noteId=${noteId}`, {
        method: 'DELETE',
      })

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return false
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.success
    },
    [apiRequest]
  )

  // ============================================
  // SUMMARIES
  // ============================================

  const saveSummary = useCallback(
    async (bookId: string, content: string, level: string): Promise<UserSummary | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest('/api/sync/summaries', {
        method: 'POST',
        body: JSON.stringify({
          bookId,
          content,
          level,
          deviceId: state.deviceId,
        }),
      })

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return null
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.summary || null
    },
    [apiRequest, state.deviceId]
  )

  const getSummaries = useCallback(
    async (bookId: string): Promise<UserSummary[]> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest(`/api/sync/summaries?bookId=${bookId}`)

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return []
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.summaries || []
    },
    [apiRequest]
  )

  const deleteSummary = useCallback(
    async (summaryId: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest(`/api/sync/summaries?summaryId=${summaryId}`, {
        method: 'DELETE',
      })

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return false
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.success
    },
    [apiRequest]
  )

  // ============================================
  // FLASHCARDS
  // ============================================

  const saveFlashcardProgress = useCallback(
    async (
      bookId: string,
      flashcardId: string,
      easeFactor: number,
      interval: number,
      repetitions: number,
      nextReview: number,
      lastReview: number
    ): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest('/api/sync/flashcards', {
        method: 'POST',
        body: JSON.stringify({
          bookId,
          flashcardId,
          easeFactor,
          interval,
          repetitions,
          nextReview,
          lastReview,
          deviceId: state.deviceId,
        }),
      })

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return false
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.success
    },
    [apiRequest, state.deviceId]
  )

  const getFlashcardProgress = useCallback(
    async (bookId: string, flashcardId: string): Promise<FlashcardProgress | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest(
        `/api/sync/flashcards?bookId=${bookId}&flashcardId=${flashcardId}`
      )

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return null
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.progress || null
    },
    [apiRequest]
  )

  const getDueFlashcards = useCallback(
    async (bookId: string): Promise<FlashcardProgress[]> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await apiRequest(`/api/sync/flashcards?bookId=${bookId}&due=true`)

      if (!response || !response.ok) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return []
      }

      const data = await response.json()
      setState((prev) => ({ ...prev, isLoading: false }))

      return data.flashcards || []
    },
    [apiRequest]
  )

  return {
    state,
    saveProgress,
    getProgress,
    getAllProgress,
    saveNote,
    getNotes,
    updateNote,
    deleteNote,
    saveSummary,
    getSummaries,
    deleteSummary,
    saveFlashcardProgress,
    getFlashcardProgress,
    getDueFlashcards,
  }
}
