'use client'

/**
 * usePipeline Hook
 * Client-side hook for interacting with the pipeline API
 */

import { useState, useCallback } from 'react'
import type { PipelineSource } from '@/lib/pipeline/types'

/**
 * Pipeline API response
 */
export interface PipelineApiResponse {
  success: boolean
  bookId?: string
  blocksCount?: number
  vectorCount?: number
  metadata?: Record<string, any>
  error?: string
}

/**
 * Pipeline hook state
 */
export interface PipelineState {
  isRunning: boolean
  error: string | null
  result: PipelineApiResponse | null
}

/**
 * Pipeline hook return type
 */
export interface UsePipelineReturn {
  state: PipelineState
  runPipelineOnUrl: (url: string, options?: PipelineRunOptions) => Promise<void>
  runPipelineOnFile: (fileUrl: string, options?: PipelineRunOptions) => Promise<void>
  runPipelineDemo: () => Promise<void>
  reset: () => void
}

/**
 * Pipeline run options
 */
export interface PipelineRunOptions {
  enableVectorization?: boolean
  enableCleaning?: boolean
  enableEnrichment?: boolean
  metadata?: Record<string, any>
}

/**
 * Hook for running the pipeline
 */
export function usePipeline(): UsePipelineReturn {
  const [state, setState] = useState<PipelineState>({
    isRunning: false,
    error: null,
    result: null,
  })

  /**
   * Run pipeline on URL
   */
  const runPipelineOnUrl = useCallback(
    async (url: string, options?: PipelineRunOptions) => {
      setState({ isRunning: true, error: null, result: null })

      try {
        const source: PipelineSource = {
          type: 'url',
          url,
        }

        const response = await fetch('/api/pipeline/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source,
            options: options || {},
          }),
        })

        if (!response.ok) {
          throw new Error(`Pipeline API error: ${response.statusText}`)
        }

        const result: PipelineApiResponse = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Pipeline execution failed')
        }

        setState({ isRunning: false, error: null, result })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isRunning: false, error: errorMessage, result: null })
        throw error
      }
    },
    []
  )

  /**
   * Run pipeline on file
   */
  const runPipelineOnFile = useCallback(
    async (fileUrl: string, options?: PipelineRunOptions) => {
      setState({ isRunning: true, error: null, result: null })

      try {
        const source: PipelineSource = {
          type: 'file',
          url: fileUrl,
        }

        const response = await fetch('/api/pipeline/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source,
            options: options || {},
          }),
        })

        if (!response.ok) {
          throw new Error(`Pipeline API error: ${response.statusText}`)
        }

        const result: PipelineApiResponse = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Pipeline execution failed')
        }

        setState({ isRunning: false, error: null, result })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState({ isRunning: false, error: errorMessage, result: null })
        throw error
      }
    },
    []
  )

  /**
   * Run demo pipeline
   */
  const runPipelineDemo = useCallback(async () => {
    setState({ isRunning: true, error: null, result: null })

    try {
      const source: PipelineSource = {
        type: 'file',
        url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
      }

      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          options: {
            enableVectorization: true,
            enableCleaning: true,
            enableEnrichment: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Pipeline API error: ${response.statusText}`)
      }

      const result: PipelineApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Pipeline demo failed')
      }

      setState({ isRunning: false, error: null, result })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState({ isRunning: false, error: errorMessage, result: null })
      throw error
    }
  }, [])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({ isRunning: false, error: null, result: null })
  }, [])

  return {
    state,
    runPipelineOnUrl,
    runPipelineOnFile,
    runPipelineDemo,
    reset,
  }
}
