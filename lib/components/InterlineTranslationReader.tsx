'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Loader2,
  Bookmark,
  BookmarkCheck,
  List,
  ArrowUp,
  ArrowLeft,
} from 'lucide-react'
import { BookParagraph } from '@/lib/types'

interface InterlineTranslationReaderProps {
  bookId: string
  paragraphs: BookParagraph[]
  currentParaIdx: number
  onParagraphChange: (idx: number) => void
  translationCache: Map<number, string>
  onTranslateRequest: (paraIdx: number) => Promise<string>
  onPlayOriginal?: (paraIdx: number) => void
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
}

export function InterlineTranslationReader({
  bookId,
  paragraphs,
  currentParaIdx,
  onParagraphChange,
  translationCache,
  onTranslateRequest,
  onPlayOriginal,
  playbackSpeed,
  onSpeedChange,
}: InterlineTranslationReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [showChapterList, setShowChapterList] = useState(false)
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set())
  const [readingHistory, setReadingHistory] = useState<number[]>([])
  const [playOriginalMode, setPlayOriginalMode] = useState(false)

  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement>(null)
  const paraRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const audioCache = useRef<Map<number, { url: string; duration: number }>>(new Map())

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

  // 自动滚动到当前段落
  useEffect(() => {
    if (paraRefs.current[currentParaIdx]) {
      paraRefs.current[currentParaIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentParaIdx])

  // 加载书签和阅读历史
  useEffect(() => {
    loadBookmarks()
    loadReadingHistory()
  }, [bookId])

  // 保存阅读进度
  useEffect(() => {
    if (currentParaIdx >= 0) {
      saveProgress(currentParaIdx)
      updateReadingHistory(currentParaIdx)
    }
  }, [currentParaIdx])

  const loadBookmarks = () => {
    const saved = localStorage.getItem(`bookmarks-${bookId}`)
    if (saved) {
      setBookmarks(new Set(JSON.parse(saved)))
    }
  }

  const saveBookmarks = (newBookmarks: Set<number>) => {
    localStorage.setItem(`bookmarks-${bookId}`, JSON.stringify([...newBookmarks]))
    setBookmarks(newBookmarks)
  }

  const toggleBookmark = (paraIdx: number) => {
    const newBookmarks = new Set(bookmarks)
    if (newBookmarks.has(paraIdx)) {
      newBookmarks.delete(paraIdx)
    } else {
      newBookmarks.add(paraIdx)
    }
    saveBookmarks(newBookmarks)
  }

  const loadReadingHistory = () => {
    const saved = localStorage.getItem(`history-${bookId}`)
    if (saved) {
      setReadingHistory(JSON.parse(saved))
    }
  }

  const updateReadingHistory = (paraIdx: number) => {
    const newHistory = [paraIdx, ...readingHistory.filter(idx => idx !== paraIdx)].slice(0, 10)
    localStorage.setItem(`history-${bookId}`, JSON.stringify(newHistory))
    setReadingHistory(newHistory)
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

  const generateAudio = async (paraIdx: number, useOriginal: boolean = false) => {
    console.log(`[Reader] Generating ${useOriginal ? 'original' : 'translated'} audio for paragraph ${paraIdx}`)

    const endpoint = useOriginal
      ? `/api/books/${bookId}/stream-tts-original`
      : `/api/books/${bookId}/stream-tts`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paraIdx, voice: 'nova', speed: playbackSpeed }),
    })

    if (!response.ok) throw new Error('Audio generation failed')

    const data = await response.json()
    const audio = { url: data.audioUrl, duration: data.duration }

    audioCache.current.set(paraIdx, audio)
    return audio
  }

  const playParagraph = async (paraIdx: number) => {
    setIsPlaying(true)

    try {
      // 如果是原文模式,不需要翻译
      if (!playOriginalMode) {
        setIsTranslating(true)
        await onTranslateRequest(paraIdx)
        setIsTranslating(false)
      }

      setIsGeneratingAudio(true)
      const audio = await generateAudio(paraIdx, playOriginalMode)
      setIsGeneratingAudio(false)

      if (audioRef.current) {
        audioRef.current.src = audio.url
        audioRef.current.playbackRate = playbackSpeed
        await audioRef.current.play()
      }
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
      onParagraphChange(currentParaIdx + 1)
      setIsPlaying(false)
      audioRef.current?.pause()
    }
  }

  const handlePrevious = () => {
    if (currentParaIdx > 0) {
      onParagraphChange(currentParaIdx - 1)
      setIsPlaying(false)
      audioRef.current?.pause()
    }
  }

  const jumpToParagraph = (idx: number) => {
    onParagraphChange(idx)
    setShowChapterList(false)
    setIsPlaying(false)
    audioRef.current?.pause()
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 音频播放结束后自动播放下一段
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (currentParaIdx < paragraphs.length - 1) {
        onParagraphChange(currentParaIdx + 1)
        playParagraph(currentParaIdx + 1)
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [currentParaIdx, paragraphs.length])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
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
                <h1 className="text-lg font-bold text-white">译文穿插阅读</h1>
                <p className="text-xs text-slate-400">
                  {paragraphs.length} 段落 · {bookmarks.size} 书签
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowChapterList(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <List className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">章节</span>
            </button>
          </div>
        </div>
      </header>

      {/* 章节列表侧边栏 */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowChapterList(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-80 bg-slate-800 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h3 className="text-lg font-semibold text-white">段落列表</h3>
              <p className="text-sm text-slate-400 mt-1">
                共 {paragraphs.length} 段 · {bookmarks.size} 个书签
              </p>
            </div>

            {/* 书签段落 */}
            {bookmarks.size > 0 && (
              <div className="p-4 border-b border-slate-700">
                <h4 className="text-sm font-medium text-blue-400 mb-2">📚 书签</h4>
                {[...bookmarks].sort((a, b) => a - b).map(idx => (
                  <button
                    key={`bookmark-${idx}`}
                    onClick={() => jumpToParagraph(idx)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded mb-1"
                  >
                    <BookmarkCheck className="w-4 h-4 inline mr-2 text-yellow-400" />
                    段落 {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* 最近阅读 */}
            {readingHistory.length > 0 && (
              <div className="p-4 border-b border-slate-700">
                <h4 className="text-sm font-medium text-green-400 mb-2">🕐 最近阅读</h4>
                {readingHistory.slice(0, 5).map(idx => (
                  <button
                    key={`history-${idx}`}
                    onClick={() => jumpToParagraph(idx)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded mb-1"
                  >
                    段落 {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* 所有段落 */}
            <div className="p-4">
              <h4 className="text-sm font-medium text-slate-400 mb-2">所有段落</h4>
              {paragraphs.map((para, idx) => (
                <button
                  key={para.id}
                  onClick={() => jumpToParagraph(idx)}
                  className={`w-full text-left px-3 py-2 text-sm rounded mb-1 transition-colors ${
                    idx === currentParaIdx
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>段落 {idx + 1}</span>
                    {bookmarks.has(idx) && (
                      <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                    )}
                  </span>
                  <span className="text-xs text-slate-400 line-clamp-1 mt-1">
                    {para.text_original?.substring(0, 50)}...
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 - 译文穿插在原文中 */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {paragraphs.map((para, idx) => {
            const translation = translationCache.get(idx) || para.text_translated
            const isBookmarked = bookmarks.has(idx)
            const isCurrent = idx === currentParaIdx

            return (
              <div
                key={para.id}
                ref={el => { paraRefs.current[idx] = el }}
                className={`mb-8 ${isCurrent ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
              >
                {/* 原文 */}
                <div
                  className={`p-6 rounded-t-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-500/10'
                      : 'bg-slate-800/50 hover:bg-slate-800'
                  }`}
                  onClick={() => jumpToParagraph(idx)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500">
                      段落 {idx + 1} / {paragraphs.length}
                    </span>
                    <div className="flex items-center space-x-2">
                      {isCurrent && (isTranslating || isGeneratingAudio || isPlaying) && (
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(idx)
                        }}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Bookmark className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-200 leading-relaxed text-base">
                    {para.text_original}
                  </p>
                </div>

                {/* 译文 - 紧跟在原文下方 */}
                {translation && (
                  <div className="bg-slate-900/50 p-6 rounded-b-xl border-t border-slate-700/50">
                    <div className="flex items-center mb-2">
                      <span className="text-xs font-medium text-blue-400">译文</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-base italic">
                      {translation}
                    </p>
                  </div>
                )}

                {/* 如果没有译文,显示提示 */}
                {!translation && isCurrent && (
                  <div className="bg-slate-900/30 p-4 rounded-b-xl border-t border-slate-700/50">
                    <p className="text-sm text-slate-500 italic">
                      点击播放按钮自动翻译并朗读
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* 返回顶部按钮 */}
      {currentParaIdx > 5 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-32 right-8 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors z-40"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      )}

      {/* 底部控制栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧: 播放控制 */}
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

            {/* 中间: 进度和设置 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-400">
                {currentParaIdx + 1} / {paragraphs.length}
              </div>

              {/* 速度控制 */}
              <select
                value={playbackSpeed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="px-3 py-1 bg-slate-800 text-white text-sm rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {speedOptions.map(speed => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>

              {/* 原文/译文切换 */}
              <button
                onClick={() => setPlayOriginalMode(!playOriginalMode)}
                className={`px-3 py-1 text-xs font-medium rounded border ${
                  playOriginalMode
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title={playOriginalMode ? '播放原文音频' : '播放译文音频'}
              >
                {playOriginalMode ? '原文' : '译文'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} />
    </div>
  )
}
