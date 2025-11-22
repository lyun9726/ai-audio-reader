'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import dynamic from 'next/dynamic'
import {
  BookOpen,
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Loader2,
  Languages,
} from 'lucide-react'
import { Book, BookParagraph } from '@/lib/types'

// Dynamic import to avoid SSR issues with PDF.js and EPUB.js
const PdfRenderer = dynamic(
  () => import('@/lib/components/PdfRenderer').then(mod => ({ default: mod.PdfRenderer })),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div> }
)

const EpubRenderer = dynamic(
  () => import('@/lib/components/EpubRenderer').then(mod => ({ default: mod.EpubRenderer })),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div> }
)

type ViewMode = 'original' | 'translated' | 'dual' | 'native'

// Extend Book type with new fields until database types are regenerated
type ExtendedBook = Book & {
  format?: 'pdf' | 'epub' | 'txt'
  file_url?: string
  page_count?: number
}

export default function ReaderPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const bookId = params.bookId as string

  const [book, setBook] = useState<ExtendedBook | null>(null)
  const [paragraphs, setParagraphs] = useState<BookParagraph[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Stream mode state
  const [currentParaIdx, setCurrentParaIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [viewMode, setViewMode] = useState<ViewMode>('translated')

  // Caches
  const [translationCache, setTranslationCache] = useState<Map<number, string>>(new Map())
  const [audioCache, setAudioCache] = useState<Map<number, { url: string; duration: number }>>(new Map())

  const audioRef = useRef<HTMLAudioElement>(null)
  const paraRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const preloadQueue = useRef<Set<number>>(new Set())

  // Load book and paragraphs
  useEffect(() => {
    if (user && bookId) {
      loadBookData()
    }
  }, [user, bookId])

  // Auto-scroll to current paragraph
  useEffect(() => {
    if (paraRefs.current[currentParaIdx]) {
      paraRefs.current[currentParaIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentParaIdx])

  // Handle audio ended
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (currentParaIdx < paragraphs.length - 1) {
        const nextIdx = currentParaIdx + 1
        setCurrentParaIdx(nextIdx)
        // Auto-play next paragraph
        setTimeout(() => playParagraph(nextIdx), 100)
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [currentParaIdx, paragraphs.length])

  const loadBookData = async () => {
    try {
      // Fetch book
      const bookRes = await fetch(`/api/books/${bookId}`)
      if (!bookRes.ok) throw new Error('Failed to load book')
      const bookData = await bookRes.json()
      setBook(bookData.book)

      // Fetch paragraphs
      const parasRes = await fetch(`/api/books/${bookId}/paragraphs`)
      if (!parasRes.ok) throw new Error('Failed to load paragraphs')
      const parasData = await parasRes.json()
      setParagraphs(parasData.paragraphs)

      // Initialize caches with existing translations
      const newTransCache = new Map<number, string>()
      parasData.paragraphs.forEach((para: BookParagraph) => {
        if (para.text_translated) {
          newTransCache.set(para.para_idx, para.text_translated)
        }
      })
      setTranslationCache(newTransCache)

      // Load progress
      const progressRes = await fetch(`/api/books/${bookId}/progress`)
      if (progressRes.ok) {
        const progressData = await progressRes.json()
        if (progressData.progress) {
          setCurrentParaIdx(progressData.progress.last_para_idx || 0)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Translate a paragraph
  const translateParagraph = async (paraIdx: number): Promise<string> => {
    // Check cache
    if (translationCache.has(paraIdx)) {
      return translationCache.get(paraIdx)!
    }

    console.log(`[Reader] Translating paragraph ${paraIdx}`)

    const response = await fetch(`/api/books/${bookId}/stream-translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paraIdx }),
    })

    if (!response.ok) throw new Error('Translation failed')

    const data = await response.json()

    // Update cache and paragraph
    setTranslationCache(prev => new Map(prev).set(paraIdx, data.translation))
    setParagraphs(prev =>
      prev.map(p =>
        p.para_idx === paraIdx ? { ...p, text_translated: data.translation } : p
      )
    )

    return data.translation
  }

  // Generate audio for a paragraph
  const generateAudio = async (paraIdx: number): Promise<{ url: string; duration: number }> => {
    // Check cache
    if (audioCache.has(paraIdx)) {
      return audioCache.get(paraIdx)!
    }

    console.log(`[Reader] Generating audio for paragraph ${paraIdx}`)

    const response = await fetch(`/api/books/${bookId}/stream-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paraIdx, voice: 'nova', speed: playbackSpeed }),
    })

    if (!response.ok) throw new Error('Audio generation failed')

    const data = await response.json()
    const audio = { url: data.audioUrl, duration: data.duration }

    // Update cache
    setAudioCache(prev => new Map(prev).set(paraIdx, audio))

    return audio
  }

  // Preload next paragraphs
  const preloadNext = async (fromIdx: number, count: number = 3) => {
    for (let i = 1; i <= count; i++) {
      const idx = fromIdx + i
      if (idx >= paragraphs.length || preloadQueue.current.has(idx)) continue

      preloadQueue.current.add(idx)

      // Preload in background
      ;(async () => {
        try {
          await translateParagraph(idx)
          await generateAudio(idx)
          console.log(`[Reader] ✓ Preloaded paragraph ${idx}`)
        } catch (error) {
          console.error(`[Reader] Failed to preload ${idx}:`, error)
        } finally {
          preloadQueue.current.delete(idx)
        }
      })()
    }
  }

  // Play a specific paragraph
  const playParagraph = async (paraIdx: number) => {
    setIsPlaying(true)
    setIsTranslating(true)

    try {
      // Step 1: Translate
      await translateParagraph(paraIdx)

      setIsTranslating(false)
      setIsGeneratingAudio(true)

      // Step 2: Generate audio
      const audio = await generateAudio(paraIdx)

      setIsGeneratingAudio(false)

      // Step 3: Play
      if (audioRef.current) {
        audioRef.current.src = audio.url
        audioRef.current.playbackRate = playbackSpeed
        await audioRef.current.play()
      }

      // Step 4: Preload next
      preloadNext(paraIdx, 3)

      // Save progress
      await saveProgress(paraIdx)
    } catch (error) {
      console.error('[Reader] Play error:', error)
      setIsPlaying(false)
      setIsTranslating(false)
      setIsGeneratingAudio(false)
      alert('播放失败: ' + (error as Error).message)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      playParagraph(currentParaIdx)
    }
  }

  const handleNext = () => {
    if (currentParaIdx < paragraphs.length - 1) {
      setCurrentParaIdx(currentParaIdx + 1)
      setIsPlaying(false)
      audioRef.current?.pause()
    }
  }

  const handlePrevious = () => {
    if (currentParaIdx > 0) {
      setCurrentParaIdx(currentParaIdx - 1)
      setIsPlaying(false)
      audioRef.current?.pause()
    }
  }

  const saveProgress = async (paraIdx: number) => {
    try {
      await fetch(`/api/books/${bookId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_para_idx: paraIdx }),
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['original', 'translated', 'dual']
    const currentIndex = modes.indexOf(viewMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setViewMode(modes[nextIndex])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Book not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Render native PDF/EPUB viewer or fallback to paragraph view
  const renderContent = () => {
    console.log('[Reader] renderContent called, book format:', book.format, 'file_url:', book.file_url)

    // Native rendering for PDF/EPUB
    if (book.format === 'pdf' && book.file_url) {
      console.log('[Reader] Rendering PDF')
      return (
        <div className="h-full">
          <PdfRenderer
            fileUrl={book.file_url}
            currentPage={currentParaIdx + 1}
            onPageChange={(page) => setCurrentParaIdx(page - 1)}
          />
        </div>
      )
    }

    if (book.format === 'epub' && book.file_url) {
      console.log('[Reader] Rendering EPUB')
      return (
        <div className="h-full">
          <EpubRenderer
            fileUrl={book.file_url}
            onLocationChange={(location) => {
              console.log('[Reader] EPUB location changed:', location)
              saveProgress(currentParaIdx)
            }}
          />
        </div>
      )
    }

    console.log('[Reader] Rendering fallback paragraph view')

    // Fallback: paragraph-based view for TXT or legacy books
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {paragraphs.map((para, idx) => (
            <div
              key={para.id}
              ref={el => { paraRefs.current[idx] = el }}
              className={`p-6 rounded-xl transition-all ${
                idx === currentParaIdx
                  ? 'bg-blue-500/10 border-2 border-blue-500'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">
                  Paragraph {idx + 1} / {paragraphs.length}
                </span>
                {idx === currentParaIdx && (
                  <div className="flex items-center space-x-2">
                    {isTranslating && (
                      <span className="flex items-center space-x-1 text-xs text-yellow-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>翻译中...</span>
                      </span>
                    )}
                    {isGeneratingAudio && (
                      <span className="flex items-center space-x-1 text-xs text-purple-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>生成音频...</span>
                      </span>
                    )}
                    {isPlaying && !isTranslating && !isGeneratingAudio && (
                      <span className="flex items-center space-x-1 text-xs text-blue-400">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                        <span>播放中</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {viewMode === 'dual' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Original</p>
                    <p className="text-slate-300 leading-relaxed">{para.text_original}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Translation</p>
                    <p className="text-white leading-relaxed">
                      {translationCache.get(idx) || para.text_translated || 'Not translated'}
                    </p>
                  </div>
                </div>
              )}

              {viewMode === 'original' && (
                <p className="text-white leading-relaxed">{para.text_original}</p>
              )}

              {viewMode === 'translated' && (
                <p className="text-white leading-relaxed text-lg">
                  {translationCache.get(idx) || para.text_translated || 'Not translated'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{book.title}</h1>
                {book.author && <p className="text-sm text-slate-400">{book.author}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Only show view mode toggle for paragraph view */}
              {!['pdf', 'epub'].includes(book.format || '') && (
                <button
                  onClick={cycleViewMode}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Languages className="w-4 h-4 text-blue-400" />
                  <span className="text-sm capitalize text-white">{viewMode}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Audio Player Controls */}
      <div className="bg-slate-900 border-t border-slate-800 sticky bottom-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentParaIdx === 0}
                className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handlePlayPause}
                disabled={isTranslating || isGeneratingAudio}
                className="p-4 bg-blue-500 hover:bg-blue-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPlaying && !isTranslating && !isGeneratingAudio ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : isTranslating || isGeneratingAudio ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={currentParaIdx >= paragraphs.length - 1}
                className="p-2 hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-400">
                {currentParaIdx + 1} / {paragraphs.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />
    </div>
  )
}
