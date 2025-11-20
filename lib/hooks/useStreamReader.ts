import { useState, useCallback, useRef, useEffect } from 'react'
import { BookParagraph } from '@/lib/types'

interface StreamReaderOptions {
  bookId: string
  paragraphs: BookParagraph[]
  voice?: string
  speed?: number
}

interface StreamState {
  currentParaIdx: number
  isPlaying: boolean
  isTranslating: boolean
  isGeneratingAudio: boolean
  translationCache: Map<number, string>
  audioCache: Map<number, { url: string; duration: number }>
}

export function useStreamReader({
  bookId,
  paragraphs,
  voice = 'nova',
  speed = 1.0,
}: StreamReaderOptions) {
  const [state, setState] = useState<StreamState>({
    currentParaIdx: 0,
    isPlaying: false,
    isTranslating: false,
    isGeneratingAudio: false,
    translationCache: new Map(),
    audioCache: new Map(),
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const preloadQueue = useRef<Set<number>>(new Set())

  // Translate a single paragraph
  const translateParagraph = useCallback(
    async (paraIdx: number): Promise<string> => {
      // Check cache first
      if (state.translationCache.has(paraIdx)) {
        return state.translationCache.get(paraIdx)!
      }

      // Check if paragraph already has translation
      const para = paragraphs[paraIdx]
      if (para?.text_translated) {
        setState(prev => {
          const newCache = new Map(prev.translationCache)
          newCache.set(paraIdx, para.text_translated!)
          return { ...prev, translationCache: newCache }
        })
        return para.text_translated
      }

      console.log(`[StreamReader] Translating paragraph ${paraIdx}`)

      try {
        const response = await fetch(`/api/books/${bookId}/stream-translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paraIdx }),
        })

        if (!response.ok) throw new Error('Translation failed')

        const data = await response.json()

        // Update cache
        setState(prev => {
          const newCache = new Map(prev.translationCache)
          newCache.set(paraIdx, data.translation)
          return { ...prev, translationCache: newCache }
        })

        return data.translation
      } catch (error) {
        console.error('[StreamReader] Translation error:', error)
        throw error
      }
    },
    [bookId, paragraphs, state.translationCache]
  )

  // Generate audio for a single paragraph
  const generateAudio = useCallback(
    async (paraIdx: number): Promise<{ url: string; duration: number }> => {
      // Check cache first
      if (state.audioCache.has(paraIdx)) {
        return state.audioCache.get(paraIdx)!
      }

      console.log(`[StreamReader] Generating audio for paragraph ${paraIdx}`)

      try {
        const response = await fetch(`/api/books/${bookId}/stream-tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paraIdx, voice, speed }),
        })

        if (!response.ok) throw new Error('Audio generation failed')

        const data = await response.json()

        // Update cache
        setState(prev => {
          const newCache = new Map(prev.audioCache)
          newCache.set(paraIdx, {
            url: data.audioUrl,
            duration: data.duration,
          })
          return { ...prev, audioCache: newCache }
        })

        return { url: data.audioUrl, duration: data.duration }
      } catch (error) {
        console.error('[StreamReader] Audio generation error:', error)
        throw error
      }
    },
    [bookId, voice, speed, state.audioCache]
  )

  // Preload next paragraphs (translate + generate audio)
  const preloadNext = useCallback(
    async (fromIdx: number, count: number = 3) => {
      for (let i = 1; i <= count; i++) {
        const idx = fromIdx + i
        if (idx >= paragraphs.length) break
        if (preloadQueue.current.has(idx)) continue

        preloadQueue.current.add(idx)

        // Preload in background
        ;(async () => {
          try {
            await translateParagraph(idx)
            await generateAudio(idx)
            console.log(`[StreamReader] ✓ Preloaded paragraph ${idx}`)
          } catch (error) {
            console.error(`[StreamReader] Failed to preload ${idx}:`, error)
          } finally {
            preloadQueue.current.delete(idx)
          }
        })()
      }
    },
    [paragraphs.length, translateParagraph, generateAudio]
  )

  // Start playing from current paragraph
  const startPlaying = useCallback(async () => {
    const paraIdx = state.currentParaIdx

    setState(prev => ({ ...prev, isPlaying: true, isTranslating: true }))

    try {
      // Step 1: Translate if needed
      await translateParagraph(paraIdx)

      setState(prev => ({ ...prev, isTranslating: false, isGeneratingAudio: true }))

      // Step 2: Generate audio
      const audio = await generateAudio(paraIdx)

      setState(prev => ({ ...prev, isGeneratingAudio: false }))

      // Step 3: Play audio
      if (audioRef.current) {
        audioRef.current.src = audio.url
        audioRef.current.playbackRate = speed
        await audioRef.current.play()
      }

      // Step 4: Preload next 3 paragraphs
      preloadNext(paraIdx, 3)
    } catch (error) {
      console.error('[StreamReader] Start playing error:', error)
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isTranslating: false,
        isGeneratingAudio: false,
      }))
    }
  }, [state.currentParaIdx, speed, translateParagraph, generateAudio, preloadNext])

  // Stop playing
  const stopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  // Go to next paragraph
  const nextParagraph = useCallback(() => {
    if (state.currentParaIdx < paragraphs.length - 1) {
      setState(prev => ({ ...prev, currentParaIdx: prev.currentParaIdx + 1 }))
    }
  }, [state.currentParaIdx, paragraphs.length])

  // Go to previous paragraph
  const previousParagraph = useCallback(() => {
    if (state.currentParaIdx > 0) {
      setState(prev => ({ ...prev, currentParaIdx: prev.currentParaIdx - 1 }))
    }
  }, [state.currentParaIdx])

  // Handle audio ended - auto advance
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (state.currentParaIdx < paragraphs.length - 1) {
        setState(prev => ({ ...prev, currentParaIdx: prev.currentParaIdx + 1 }))
        // Auto-start next paragraph
        setTimeout(() => startPlaying(), 100)
      } else {
        setState(prev => ({ ...prev, isPlaying: false }))
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [state.currentParaIdx, paragraphs.length, startPlaying])

  return {
    ...state,
    audioRef,
    startPlaying,
    stopPlaying,
    nextParagraph,
    previousParagraph,
    goToParagraph: (idx: number) => {
      setState(prev => ({ ...prev, currentParaIdx: idx, isPlaying: false }))
    },
  }
}
