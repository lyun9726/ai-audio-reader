'use client'

import { useState, useCallback } from 'react'
import type { ReaderBlock } from '@/lib/types'
import type { SummaryResponse, QAMessage, MindmapResponse } from '@/lib/ai/types'

export function useAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Summary
  const [summary, setSummary] = useState<SummaryResponse | null>(null)

  const generateSummary = useCallback(async (blocks: ReaderBlock[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      })

      if (!response.ok) throw new Error('Summary generation failed')

      const data: SummaryResponse = await response.json()
      setSummary(data)

      return { success: true, data }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate summary'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Q&A with streaming
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([])
  const [streamingAnswer, setStreamingAnswer] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const askQuestion = useCallback(async (blocks: ReaderBlock[], question: string) => {
    setIsStreaming(true)
    setStreamingAnswer('')
    setError(null)

    // Add user message
    const userMessage: QAMessage = {
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }
    setQaMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/ai/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks, question }),
      })

      if (!response.ok) throw new Error('Q&A failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response stream')

      let fullAnswer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullAnswer += chunk
        setStreamingAnswer(fullAnswer)
      }

      // Add assistant message
      const assistantMessage: QAMessage = {
        role: 'assistant',
        content: fullAnswer,
        timestamp: Date.now(),
      }
      setQaMessages(prev => [...prev, assistantMessage])
      setStreamingAnswer('')

      return { success: true, answer: fullAnswer }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to get answer'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const clearQA = useCallback(() => {
    setQaMessages([])
    setStreamingAnswer('')
  }, [])

  // Mindmap
  const [mindmap, setMindmap] = useState<MindmapResponse | null>(null)

  const generateMindmap = useCallback(async (blocks: ReaderBlock[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      })

      if (!response.ok) throw new Error('Mindmap generation failed')

      const data: MindmapResponse = await response.json()
      setMindmap(data)

      return { success: true, data }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate mindmap'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Explain with streaming
  const [explanation, setExplanation] = useState('')

  const explainText = useCallback(async (blocks: ReaderBlock[], userSelection: string) => {
    setIsStreaming(true)
    setExplanation('')
    setError(null)

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks, userSelection }),
      })

      if (!response.ok) throw new Error('Explanation failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response stream')

      let fullExplanation = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullExplanation += chunk
        setExplanation(fullExplanation)
      }

      return { success: true, explanation: fullExplanation }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to explain text'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const clearExplanation = useCallback(() => {
    setExplanation('')
  }, [])

  return {
    // State
    isLoading,
    isStreaming,
    error,

    // Summary
    summary,
    generateSummary,

    // Q&A
    qaMessages,
    streamingAnswer,
    askQuestion,
    clearQA,

    // Mindmap
    mindmap,
    generateMindmap,

    // Explain
    explanation,
    explainText,
    clearExplanation,
  }
}
