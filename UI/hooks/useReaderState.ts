/**
 * Unified Reader State Management Hook
 * Integrates all reader functionality: parsing, pagination, translation, TTS, URL fetching
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// Types
export interface ReaderBlock {
  id: string
  type: 'paragraph' | 'image' | 'heading'
  text?: string
  url?: string
  level?: number
  meta?: Record<string, any>
}

export interface ReaderState {
  // Content
  blocks: ReaderBlock[]
  currentBlockIndex: number
  totalBlocks: number

  // Playback
  isPlaying: boolean
  speed: number
  voice: string
  autoScroll: boolean

  // Translation
  translationEnabled: boolean
  targetLanguage: string
  translations: Map<string, string>

  // Progress
  progress: number
  timeRemaining: string

  // Loading states
  isLoading: boolean
  isTranslating: boolean
  isSpeaking: boolean

  // Layout
  layoutMode: 'single' | 'split' | 'overlay'
}

export interface UseReaderStateReturn {
  state: ReaderState

  // Content actions
  loadFromUrl: (url: string) => Promise<void>
  loadFromFile: (file: File) => Promise<void>
  loadBlocks: (blocks: ReaderBlock[]) => void

  // Navigation
  goToBlock: (index: number) => void
  nextBlock: () => void
  prevBlock: () => void

  // Playback
  togglePlay: () => void
  setSpeed: (speed: number) => void
  setVoice: (voice: string) => void
  playBlock: (blockId: string) => void
  stopPlayback: () => void

  // Translation
  toggleTranslation: () => void
  setTargetLanguage: (lang: string) => void
  translateBlock: (blockId: string) => Promise<void>
  translateAllBlocks: () => Promise<void>

  // Layout
  setLayoutMode: (mode: 'single' | 'split' | 'overlay') => void

  // Utility
  reset: () => void
}

const initialState: ReaderState = {
  blocks: [],
  currentBlockIndex: 0,
  totalBlocks: 0,
  isPlaying: false,
  speed: 1.0,
  voice: 'default',
  autoScroll: true,
  translationEnabled: false,
  targetLanguage: 'zh',
  translations: new Map(),
  progress: 0,
  timeRemaining: '0:00',
  isLoading: false,
  isTranslating: false,
  isSpeaking: false,
  layoutMode: 'single',
}

export function useReaderState(): UseReaderStateReturn {
  const [state, setState] = useState<ReaderState>(initialState)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ==========================================
  // Content Loading
  // ==========================================

  /**
   * Load content from URL
   */
  const loadFromUrl = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`Failed to parse URL: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.blocks) {
        loadBlocks(data.blocks)
      } else {
        throw new Error(data.error || 'Failed to parse URL')
      }
    } catch (error) {
      console.error('[Reader] Load from URL error:', error)
      // Fallback to demo blocks
      loadDemoBlocks()
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  /**
   * Load content from file
   */
  const loadFromFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to parse file: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.blocks) {
        loadBlocks(data.blocks)
      } else {
        throw new Error(data.error || 'Failed to parse file')
      }
    } catch (error) {
      console.error('[Reader] Load from file error:', error)
      loadDemoBlocks()
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  /**
   * Load blocks directly
   */
  const loadBlocks = useCallback((blocks: ReaderBlock[]) => {
    setState(prev => ({
      ...prev,
      blocks,
      totalBlocks: blocks.length,
      currentBlockIndex: 0,
      progress: 0,
      translations: new Map(),
    }))
  }, [])

  /**
   * Load demo blocks
   */
  const loadDemoBlocks = useCallback(() => {
    const demoBlocks: ReaderBlock[] = [
      {
        id: 'demo-1',
        type: 'heading',
        text: 'The Great Gatsby - Chapter 1',
        level: 1,
      },
      {
        id: 'demo-2',
        type: 'paragraph',
        text: 'In my younger and more vulnerable years my father gave me some advice that I\'ve been turning over in my mind ever since.',
      },
      {
        id: 'demo-3',
        type: 'paragraph',
        text: '"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."',
      },
      {
        id: 'demo-4',
        type: 'paragraph',
        text: 'He didn\'t say any more, but we\'ve always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.',
      },
      {
        id: 'demo-5',
        type: 'paragraph',
        text: 'In consequence, I\'m inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.',
      },
    ]

    loadBlocks(demoBlocks)
  }, [loadBlocks])

  // ==========================================
  // Navigation
  // ==========================================

  const goToBlock = useCallback((index: number) => {
    setState(prev => {
      const newIndex = Math.max(0, Math.min(index, prev.totalBlocks - 1))
      const progress = prev.totalBlocks > 0 ? (newIndex / prev.totalBlocks) * 100 : 0

      return {
        ...prev,
        currentBlockIndex: newIndex,
        progress,
      }
    })
  }, [])

  const nextBlock = useCallback(() => {
    setState(prev => {
      if (prev.currentBlockIndex < prev.totalBlocks - 1) {
        const newIndex = prev.currentBlockIndex + 1
        const progress = (newIndex / prev.totalBlocks) * 100
        return { ...prev, currentBlockIndex: newIndex, progress }
      }
      return prev
    })
  }, [])

  const prevBlock = useCallback(() => {
    setState(prev => {
      if (prev.currentBlockIndex > 0) {
        const newIndex = prev.currentBlockIndex - 1
        const progress = (newIndex / prev.totalBlocks) * 100
        return { ...prev, currentBlockIndex: newIndex, progress }
      }
      return prev
    })
  }, [])

  // ==========================================
  // Playback (TTS)
  // ==========================================

  const playCurrentBlock = useCallback(async () => {
    const currentBlock = state.blocks[state.currentBlockIndex]
    if (!currentBlock || !currentBlock.text) return

    setState(prev => ({ ...prev, isSpeaking: true }))

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentBlock.text,
          voice: state.voice,
          speed: state.speed,
        }),
      })

      if (!response.ok) {
        throw new Error('TTS failed')
      }

      const data = await response.json()

      if (data.success && data.audioUrl) {
        // Play audio
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl
          audioRef.current.playbackRate = state.speed
          await audioRef.current.play()
        }
      }
    } catch (error) {
      console.error('[Reader] TTS error:', error)
      setState(prev => ({ ...prev, isSpeaking: false, isPlaying: false }))
    }
  }, [state.blocks, state.currentBlockIndex, state.voice, state.speed])

  const togglePlay = useCallback(() => {
    setState(prev => {
      const newIsPlaying = !prev.isPlaying

      if (newIsPlaying) {
        playCurrentBlock()
      } else {
        if (audioRef.current) {
          audioRef.current.pause()
        }
      }

      return { ...prev, isPlaying: newIsPlaying }
    })
  }, [playCurrentBlock])

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }))
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }, [])

  const setVoice = useCallback((voice: string) => {
    setState(prev => ({ ...prev, voice }))
  }, [])

  const playBlock = useCallback(async (blockId: string) => {
    const blockIndex = state.blocks.findIndex(b => b.id === blockId)
    if (blockIndex !== -1) {
      goToBlock(blockIndex)
      setState(prev => ({ ...prev, isPlaying: true }))
      await playCurrentBlock()
    }
  }, [state.blocks, goToBlock, playCurrentBlock])

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setState(prev => ({ ...prev, isPlaying: false, isSpeaking: false }))
  }, [])

  // ==========================================
  // Translation
  // ==========================================

  const toggleTranslation = useCallback(() => {
    setState(prev => ({ ...prev, translationEnabled: !prev.translationEnabled }))
  }, [])

  const setTargetLanguage = useCallback((lang: string) => {
    setState(prev => ({
      ...prev,
      targetLanguage: lang,
      translations: new Map(), // Clear cache when changing language
    }))
  }, [])

  const translateBlock = useCallback(async (blockId: string) => {
    const block = state.blocks.find(b => b.id === blockId)
    if (!block || !block.text) return

    // Check cache
    if (state.translations.has(blockId)) return

    setState(prev => ({ ...prev, isTranslating: true }))

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: block.text,
          targetLang: state.targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()

      if (data.success && data.translated) {
        setState(prev => {
          const newTranslations = new Map(prev.translations)
          newTranslations.set(blockId, data.translated)
          return { ...prev, translations: newTranslations }
        })
      }
    } catch (error) {
      console.error('[Reader] Translation error:', error)
    } finally {
      setState(prev => ({ ...prev, isTranslating: false }))
    }
  }, [state.blocks, state.targetLanguage, state.translations])

  const translateAllBlocks = useCallback(async () => {
    for (const block of state.blocks) {
      if (block.text && !state.translations.has(block.id)) {
        await translateBlock(block.id)
      }
    }
  }, [state.blocks, state.translations, translateBlock])

  // ==========================================
  // Layout
  // ==========================================

  const setLayoutMode = useCallback((mode: 'single' | 'split' | 'overlay') => {
    setState(prev => ({ ...prev, layoutMode: mode }))
  }, [])

  // ==========================================
  // Audio Element Setup
  // ==========================================

  useEffect(() => {
    audioRef.current = new Audio()

    audioRef.current.addEventListener('ended', () => {
      setState(prev => ({ ...prev, isSpeaking: false }))

      // Auto-advance to next block if playing
      if (state.isPlaying && state.autoScroll) {
        nextBlock()
      } else {
        setState(prev => ({ ...prev, isPlaying: false }))
      }
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current)
      }
    }
  }, [])

  // ==========================================
  // Load demo on mount
  // ==========================================

  useEffect(() => {
    if (state.blocks.length === 0) {
      loadDemoBlocks()
    }
  }, [])

  // ==========================================
  // Reset
  // ==========================================

  const reset = useCallback(() => {
    stopPlayback()
    setState(initialState)
  }, [stopPlayback])

  return {
    state,
    loadFromUrl,
    loadFromFile,
    loadBlocks,
    goToBlock,
    nextBlock,
    prevBlock,
    togglePlay,
    setSpeed,
    setVoice,
    playBlock,
    stopPlayback,
    toggleTranslation,
    setTargetLanguage,
    translateBlock,
    translateAllBlocks,
    setLayoutMode,
    reset,
  }
}
