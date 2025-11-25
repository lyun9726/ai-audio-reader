'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ReaderBlock } from '@/lib/types'
import { Button } from '../common/Button'

interface TTSPlayerProps {
  blocks: ReaderBlock[]
  currentBlockIndex: number
  onSentenceChange?: (sentenceIndex: number) => void
  onBlockEnd?: (blockIndex: number) => void
  onBlockChange?: (blockIndex: number) => void
}

interface Sentence {
  text: string
  start: number
  end: number
}

export function TTSPlayer({
  blocks,
  currentBlockIndex,
  onSentenceChange,
  onBlockEnd,
  onBlockChange,
}: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [sentences, setSentences] = useState<Sentence[]>([])

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const currentBlockRef = useRef(currentBlockIndex)

  // Update sentences when block changes
  useEffect(() => {
    currentBlockRef.current = currentBlockIndex
    const block = blocks[currentBlockIndex]

    if (!block || block.type !== 'paragraph' || !block.text) {
      setSentences([])
      return
    }

    const parsedSentences = splitIntoSentences(block.text)
    setSentences(parsedSentences)
    setCurrentSentence(0)
  }, [blocks, currentBlockIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const block = blocks[currentBlockRef.current]
    if (!block || block.type !== 'paragraph' || !block.text) return

    const utterance = new SpeechSynthesisUtterance(block.text)
    utteranceRef.current = utterance

    // Configure speech
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Track sentence progress (approximate)
    let wordIndex = 0
    utterance.onboundary = (event) => {
      if (event.name === 'sentence') {
        const sentenceIdx = Math.floor(
          (event.charIndex / block.text!.length) * sentences.length
        )
        setCurrentSentence(sentenceIdx)
        onSentenceChange?.(sentenceIdx)
      }
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      onBlockEnd?.(currentBlockRef.current)

      // Auto-advance to next block
      const nextIndex = currentBlockRef.current + 1
      if (nextIndex < blocks.length) {
        onBlockChange?.(nextIndex)
        currentBlockRef.current = nextIndex
        // Auto-play next block
        setTimeout(() => {
          speak()
        }, 500)
      }
    }

    utterance.onerror = (event) => {
      console.error('[TTS Error]', event)
      setIsPlaying(false)
      setIsPaused(false)
    }

    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
    setIsPaused(false)
  }, [blocks, sentences, onSentenceChange, onBlockEnd, onBlockChange])

  const handlePlay = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech is not supported in your browser.')
      return
    }

    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
    } else {
      speak()
    }
  }

  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentSentence(0)
  }

  return (
    <div className="flex items-center gap-2">
      {!isPlaying && !isPaused && (
        <Button
          variant="primary"
          size="sm"
          onClick={handlePlay}
          disabled={sentences.length === 0}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      )}

      {isPlaying && (
        <Button variant="primary" size="sm" onClick={handlePause}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      )}

      {isPaused && (
        <Button variant="primary" size="sm" onClick={handlePlay}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      )}

      {(isPlaying || isPaused) && (
        <Button variant="secondary" size="sm" onClick={handleStop}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      )}

      {sentences.length > 0 && (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {currentSentence + 1} / {sentences.length}
        </span>
      )}
    </div>
  )
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): Sentence[] {
  // Simple sentence splitting by punctuation
  const pattern = /[.!?]+\s+/g
  const sentences: Sentence[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const sentenceText = text.slice(lastIndex, match.index + match[0].length).trim()
    if (sentenceText) {
      sentences.push({
        text: sentenceText,
        start: lastIndex,
        end: match.index + match[0].length,
      })
    }
    lastIndex = match.index + match[0].length
  }

  // Add remaining text as last sentence
  const remaining = text.slice(lastIndex).trim()
  if (remaining) {
    sentences.push({
      text: remaining,
      start: lastIndex,
      end: text.length,
    })
  }

  return sentences.length > 0 ? sentences : [{ text, start: 0, end: text.length }]
}

/**
 * Get current highlighted sentence text
 */
export function useHighlightedSentence(
  text: string | undefined,
  currentSentence: number
): string | null {
  if (!text) return null

  const sentences = splitIntoSentences(text)
  return sentences[currentSentence]?.text || null
}
