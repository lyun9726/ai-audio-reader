import { create } from 'zustand'

export interface Block {
  id: string
  order: number
  text: string
  translation?: string
}

interface TTSState {
  isPlaying: boolean
  rate: number
  pitch: number
  voiceId: string
  currentAudio: HTMLAudioElement | null
}

interface TranslationState {
  enabled: boolean
  targetLanguage: string
  translatedBlocks: Map<string, string>
}

interface ReaderState {
  // Content
  bookId: string | null
  title: string
  blocks: Block[]
  currentBlockIndex: number

  // View mode
  viewMode: 'scroll' | 'paginated'

  // TTS
  tts: TTSState

  // Translation
  translation: TranslationState

  // Actions
  setBook: (bookId: string, title: string, blocks: Block[]) => void
  setBlocks: (blocks: Block[]) => void
  setCurrentBlockIndex: (index: number) => void
  setViewMode: (mode: 'scroll' | 'paginated') => void

  // TTS Actions
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setVoiceId: (voiceId: string) => void

  // Translation Actions
  setTranslationEnabled: (enabled: boolean) => void
  setTargetLanguage: (language: string) => void
  translateBlock: (blockId: string) => Promise<void>
  translateAllBlocks: () => Promise<void>
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  // Initial state
  bookId: null,
  title: '',
  blocks: [],
  currentBlockIndex: 0,
  viewMode: 'scroll',

  tts: {
    isPlaying: false,
    rate: 1.0,
    pitch: 1.0,
    voiceId: 'alloy',
    currentAudio: null,
  },

  translation: {
    enabled: false,
    targetLanguage: 'zh',
    translatedBlocks: new Map(),
  },

  // Content actions
  setBook: (bookId, title, blocks) => {
    set({ bookId, title, blocks, currentBlockIndex: 0 })
  },

  setBlocks: (blocks) => {
    set({ blocks })
  },

  setCurrentBlockIndex: (index) => {
    set({ currentBlockIndex: index })
  },

  setViewMode: (mode) => {
    set({ viewMode: mode })
  },

  // TTS Actions
  play: async () => {
    const { blocks, currentBlockIndex, tts } = get()
    const currentBlock = blocks[currentBlockIndex]

    if (!currentBlock) return

    // Stop any existing audio
    if (tts.currentAudio) {
      tts.currentAudio.pause()
      tts.currentAudio = null
    }

    try {
      // Call TTS API
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentBlock.text,
          voiceId: tts.voiceId,
          rate: tts.rate,
          pitch: tts.pitch,
        }),
      })

      if (!response.ok) throw new Error('TTS synthesis failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      audio.playbackRate = tts.rate

      audio.onended = () => {
        set((state) => ({
          tts: { ...state.tts, isPlaying: false, currentAudio: null },
        }))

        // Auto-advance to next block
        const nextIndex = get().currentBlockIndex + 1
        if (nextIndex < get().blocks.length) {
          set({ currentBlockIndex: nextIndex })
          get().play()
        }
      }

      await audio.play()

      set((state) => ({
        tts: { ...state.tts, isPlaying: true, currentAudio: audio },
      }))
    } catch (error) {
      console.error('[TTS Play Error]', error)
      set((state) => ({
        tts: { ...state.tts, isPlaying: false },
      }))
    }
  },

  pause: () => {
    const { tts } = get()
    if (tts.currentAudio) {
      tts.currentAudio.pause()
      set((state) => ({
        tts: { ...state.tts, isPlaying: false },
      }))
    }
  },

  stop: () => {
    const { tts } = get()
    if (tts.currentAudio) {
      tts.currentAudio.pause()
      tts.currentAudio.currentTime = 0
      set((state) => ({
        tts: { ...state.tts, isPlaying: false, currentAudio: null },
      }))
    }
  },

  setRate: (rate) => {
    const { tts } = get()
    if (tts.currentAudio) {
      tts.currentAudio.playbackRate = rate
    }
    set((state) => ({
      tts: { ...state.tts, rate },
    }))
  },

  setPitch: (pitch) => {
    set((state) => ({
      tts: { ...state.tts, pitch },
    }))
  },

  setVoiceId: (voiceId) => {
    set((state) => ({
      tts: { ...state.tts, voiceId },
    }))
  },

  // Translation Actions
  setTranslationEnabled: (enabled) => {
    set((state) => ({
      translation: { ...state.translation, enabled },
    }))
  },

  setTargetLanguage: (language) => {
    set((state) => ({
      translation: { ...state.translation, targetLanguage: language },
    }))
  },

  translateBlock: async (blockId) => {
    const { blocks, translation } = get()
    const block = blocks.find((b) => b.id === blockId)

    if (!block || translation.translatedBlocks.has(blockId)) return

    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: block.id, text: block.text }],
          targetLanguage: translation.targetLanguage,
        }),
      })

      const data = await response.json()
      const result = data.results?.[0]

      if (result) {
        set((state) => ({
          translation: {
            ...state.translation,
            translatedBlocks: new Map(state.translation.translatedBlocks).set(
              blockId,
              result.translation
            ),
          },
        }))
      }
    } catch (error) {
      console.error('[Translation Error]', error)
    }
  },

  translateAllBlocks: async () => {
    const { blocks, translation } = get()

    try {
      const response = await fetch('/api/translate/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: blocks.map((b) => ({ id: b.id, text: b.text })),
          targetLanguage: translation.targetLanguage,
        }),
      })

      const data = await response.json()

      const newTranslations = new Map(translation.translatedBlocks)
      data.results?.forEach((result: any) => {
        newTranslations.set(result.id, result.translation)
      })

      set((state) => ({
        translation: {
          ...state.translation,
          translatedBlocks: newTranslations,
        },
      }))
    } catch (error) {
      console.error('[Batch Translation Error]', error)
    }
  },
}))
