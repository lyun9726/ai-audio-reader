'use client'

/**
 * useDeepReading Hook
 * Provides deep reading features: summaries, quizzes, flashcards, memory, plans
 */

import { useState, useCallback } from 'react'
import type { ReaderBlock } from '@/lib/types'
import type { SummaryLevel, SummaryResult } from '@/lib/ai/summaryGenerator'
import type { QuizType, QuizItem } from '@/lib/ai/quizGenerator'
import type { Flashcard } from '@/lib/ai/flashcardGenerator'
import type { StudyPlan } from '@/lib/ai/planGenerator'

/**
 * Deep reading state
 */
export interface DeepReadingState {
  isLoading: boolean
  error: string | null
}

/**
 * Hook return type
 */
export interface UseDeepReadingReturn {
  // State
  state: DeepReadingState

  // Summary
  generateSummary: (
    bookId: string,
    blocks: ReaderBlock[],
    level?: SummaryLevel
  ) => Promise<SummaryResult | null>

  // Quiz
  generateQuiz: (
    bookId: string,
    blocks: ReaderBlock[],
    quizType?: QuizType,
    count?: number
  ) => Promise<QuizItem[] | null>

  // Flashcards
  generateFlashcards: (
    bookId: string,
    blocks: ReaderBlock[],
    count?: number
  ) => Promise<Flashcard[] | null>

  // Memory
  rememberBook: (
    bookId: string,
    content: string,
    summary: string,
    meta?: any
  ) => Promise<boolean>

  queryMemory: (
    bookId: string,
    question: string,
    topK?: number
  ) => Promise<any[] | null>

  // Study plan
  generatePlan: (
    bookId: string,
    blocks: ReaderBlock[],
    days?: number
  ) => Promise<StudyPlan | null>

  // Reset
  reset: () => void
}

/**
 * useDeepReading hook
 */
export function useDeepReading(): UseDeepReadingReturn {
  const [state, setState] = useState<DeepReadingState>({
    isLoading: false,
    error: null,
  })

  /**
   * Generate summary
   */
  const generateSummary = useCallback(
    async (
      bookId: string,
      blocks: ReaderBlock[],
      level: SummaryLevel = 'short'
    ): Promise<SummaryResult | null> => {
      setState({ isLoading: true, error: null })

      try {
        const response = await fetch('/api/ai/deepsummary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, blocks, level }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate summary')
        }

        setState({ isLoading: false, error: null })
        return data.result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isLoading: false, error: errorMessage })
        return null
      }
    },
    []
  )

  /**
   * Generate quiz
   */
  const generateQuiz = useCallback(
    async (
      bookId: string,
      blocks: ReaderBlock[],
      quizType: QuizType = 'mcq',
      count: number = 10
    ): Promise<QuizItem[] | null> => {
      setState({ isLoading: true, error: null })

      try {
        const response = await fetch('/api/ai/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, blocks, quizType, count }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate quiz')
        }

        setState({ isLoading: false, error: null })
        return data.items
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isLoading: false, error: errorMessage })
        return null
      }
    },
    []
  )

  /**
   * Generate flashcards
   */
  const generateFlashcards = useCallback(
    async (
      bookId: string,
      blocks: ReaderBlock[],
      count: number = 20
    ): Promise<Flashcard[] | null> => {
      setState({ isLoading: true, error: null })

      try {
        const response = await fetch('/api/ai/generate-flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, blocks, count }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate flashcards')
        }

        setState({ isLoading: false, error: null })
        return data.flashcards
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isLoading: false, error: errorMessage })
        return null
      }
    },
    []
  )

  /**
   * Remember book content
   */
  const rememberBook = useCallback(
    async (
      bookId: string,
      content: string,
      summary: string,
      meta?: any
    ): Promise<boolean> => {
      setState({ isLoading: true, error: null })

      try {
        const response = await fetch('/api/ai/remember', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, content, summary, meta }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to remember content')
        }

        setState({ isLoading: false, error: null })
        return true
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isLoading: false, error: errorMessage })
        return false
      }
    },
    []
  )

  /**
   * Query memory
   */
  const queryMemory = useCallback(
    async (
      bookId: string,
      question: string,
      topK: number = 5
    ): Promise<any[] | null> => {
      setState({ isLoading: true, error: null })

      try {
        const response = await fetch('/api/ai/query-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, question, topK }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to query memory')
        }

        setState({ isLoading: false, error: null })
        return data.answers
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isLoading: false, error: errorMessage })
        return null
      }
    },
    []
  )

  /**
   * Generate study plan
   */
  const generatePlan = useCallback(
    async (
      bookId: string,
      blocks: ReaderBlock[],
      days: number = 7
    ): Promise<StudyPlan | null> => {
      setState({ isLoading: true, error: null })

      try {
        const response = await fetch('/api/ai/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, blocks, days }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate plan')
        }

        setState({ isLoading: false, error: null })
        return data.plan
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isLoading: false, error: errorMessage })
        return null
      }
    },
    []
  )

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({ isLoading: false, error: null })
  }, [])

  return {
    state,
    generateSummary,
    generateQuiz,
    generateFlashcards,
    rememberBook,
    queryMemory,
    generatePlan,
    reset,
  }
}
