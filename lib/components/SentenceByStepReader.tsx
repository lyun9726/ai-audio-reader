/**
 * 逐句对照翻译阅读器
 *
 * 格式：
 * 【原文】This is the first sentence.
 * 【译文】这是第一句。
 *
 * 【原文】This is the second sentence.
 * 【译文】这是第二句。
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { BookParagraph } from '@/lib/types'
import { Play, Pause, SkipBack, SkipForward, Loader2, Volume2, ChevronUp } from 'lucide-react'
import { splitIntoSentences, type Sentence } from '@/lib/services/sentenceSplitter'

interface SentenceByStepReaderProps {
  bookId: string
  paragraphs: BookParagraph[]
  sourceLang: string
  targetLang: string
  currentParaIdx: number
  onParagraphChange: (idx: number) => void
}

interface SentencePair {
  original: string
  translated: string | null
  sentenceIdx: number
  paraIdx: number
  translating: boolean
}

export default function SentenceByStepReader({
  bookId,
  paragraphs,
  sourceLang,
  targetLang,
  currentParaIdx,
  onParagraphChange
}: SentenceByStepReaderProps) {
  const [sentencePairs, setSentencePairs] = useState<SentencePair[]>([])
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const sentenceRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // 初始化：将当前段落拆分为句子
  useEffect(() => {
    if (currentParaIdx >= paragraphs.length) return

    const currentPara = paragraphs[currentParaIdx]
    const sentences = splitIntoSentences(currentPara.text_original, sourceLang)

    console.log('[SentenceReader] Split paragraph into', sentences.length, 'sentences')

    // 创建句子对
    const pairs: SentencePair[] = sentences.map((sent, idx) => ({
      original: sent.text,
      translated: null, // 懒加载翻译
      sentenceIdx: idx,
      paraIdx: currentParaIdx,
      translating: false
    }))

    setSentencePairs(pairs)
    setCurrentSentenceIdx(0)
    setPlaying(false)
  }, [currentParaIdx, paragraphs, sourceLang])

  // 翻译单个句子
  const translateSentence = useCallback(async (sentenceIdx: number) => {
    if (sentencePairs[sentenceIdx]?.translated) {
      return // 已翻译，跳过
    }

    setSentencePairs(prev => {
      const updated = [...prev]
      if (updated[sentenceIdx]) {
        updated[sentenceIdx].translating = true
      }
      return updated
    })

    try {
      const originalText = sentencePairs[sentenceIdx].original

      const response = await fetch(`/api/books/${bookId}/translate-sentence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          sourceLang,
          targetLang
        })
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const { translation } = await response.json()

      setSentencePairs(prev => {
        const updated = [...prev]
        if (updated[sentenceIdx]) {
          updated[sentenceIdx].translated = translation
          updated[sentenceIdx].translating = false
        }
        return updated
      })
    } catch (error) {
      console.error('[SentenceReader] Translation error:', error)
      setSentencePairs(prev => {
        const updated = [...prev]
        if (updated[sentenceIdx]) {
          updated[sentenceIdx].translating = false
          updated[sentenceIdx].translated = '翻译失败'
        }
        return updated
      })
    }
  }, [bookId, sentencePairs, sourceLang, targetLang])

  // 生成TTS音频
  const generateTTS = useCallback(async (text: string, lang: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/sentence-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          lang,
          speed: playbackSpeed
        })
      })

      if (!response.ok) {
        throw new Error('TTS generation failed')
      }

      const audioBlob = await response.blob()
      return URL.createObjectURL(audioBlob)
    } catch (error) {
      console.error('[SentenceReader] TTS error:', error)
      return null
    }
  }, [bookId, playbackSpeed])

  // 播放当前句子
  const playSentence = useCallback(async (sentenceIdx: number) => {
    if (sentenceIdx >= sentencePairs.length) {
      // 播放完毕，移动到下一段
      if (currentParaIdx < paragraphs.length - 1) {
        onParagraphChange(currentParaIdx + 1)
      }
      return
    }

    setCurrentSentenceIdx(sentenceIdx)

    // 滚动到当前句子
    const element = sentenceRefs.current.get(sentenceIdx)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // 翻译句子（如果还没翻译）
    if (!sentencePairs[sentenceIdx].translated && !sentencePairs[sentenceIdx].translating) {
      await translateSentence(sentenceIdx)
    }

    // 生成并播放TTS
    const translation = sentencePairs[sentenceIdx].translated
    if (translation) {
      setLoading(true)
      const audioUrl = await generateTTS(translation, targetLang)
      setLoading(false)

      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.playbackRate = playbackSpeed
        await audioRef.current.play()
      }
    }
  }, [sentencePairs, currentParaIdx, paragraphs.length, onParagraphChange, translateSentence, generateTTS, targetLang, playbackSpeed])

  // 音频播放完成，自动下一句
  const handleAudioEnded = useCallback(() => {
    if (playing) {
      const nextIdx = currentSentenceIdx + 1
      if (nextIdx < sentencePairs.length) {
        playSentence(nextIdx)
      } else {
        setPlaying(false)
        // 自动下一段
        if (currentParaIdx < paragraphs.length - 1) {
          onParagraphChange(currentParaIdx + 1)
        }
      }
    }
  }, [playing, currentSentenceIdx, sentencePairs.length, playSentence, currentParaIdx, paragraphs.length, onParagraphChange])

  // 开始/暂停播放
  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      audioRef.current?.pause()
    } else {
      setPlaying(true)
      playSentence(currentSentenceIdx)
    }
  }

  // 上一句
  const previousSentence = () => {
    const prevIdx = Math.max(0, currentSentenceIdx - 1)
    setCurrentSentenceIdx(prevIdx)
    if (playing) {
      playSentence(prevIdx)
    }
  }

  // 下一句
  const nextSentence = () => {
    const nextIdx = Math.min(sentencePairs.length - 1, currentSentenceIdx + 1)
    setCurrentSentenceIdx(nextIdx)
    if (playing) {
      playSentence(nextIdx)
    }
  }

  // 返回顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 监听滚动显示返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {/* 句子列表 */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {sentencePairs.map((pair, idx) => (
          <div
            key={idx}
            ref={el => {
              if (el) sentenceRefs.current.set(idx, el)
            }}
            onClick={() => {
              setCurrentSentenceIdx(idx)
              if (playing) {
                playSentence(idx)
              }
            }}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
              idx === currentSentenceIdx
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            {/* 原文 */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-blue-400 mb-2">
                【原文】
              </div>
              <div className="text-white leading-relaxed">
                {pair.original}
              </div>
            </div>

            {/* 译文 */}
            <div>
              <div className="text-xs font-semibold text-green-400 mb-2">
                【译文】
              </div>
              {pair.translating ? (
                <div className="flex items-center text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  翻译中...
                </div>
              ) : pair.translated ? (
                <div className="text-slate-200 leading-relaxed italic">
                  {pair.translated}
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  点击播放自动翻译
                </div>
              )}
            </div>

            {/* 句子编号 */}
            <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
              句子 {idx + 1} / {sentencePairs.length}
            </div>
          </div>
        ))}
      </div>

      {/* 底部控制栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-4 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto">
          {/* 进度显示 */}
          <div className="text-center mb-3">
            <div className="text-sm text-slate-400">
              句子 {currentSentenceIdx + 1} / {sentencePairs.length}
              <span className="mx-2">·</span>
              段落 {currentParaIdx + 1} / {paragraphs.length}
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-4">
            {/* 上一句 */}
            <button
              onClick={previousSentence}
              disabled={currentSentenceIdx === 0}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            {/* 播放/暂停 */}
            <button
              onClick={togglePlay}
              disabled={loading}
              className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : playing ? (
                <Pause className="w-6 h-6 text-white fill-current" />
              ) : (
                <Play className="w-6 h-6 text-white fill-current" />
              )}
            </button>

            {/* 下一句 */}
            <button
              onClick={nextSentence}
              disabled={currentSentenceIdx === sentencePairs.length - 1}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>

            {/* 速度控制 */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>
          </div>
        </div>
      </div>

      {/* 返回顶部按钮 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 p-3 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all z-40"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  )
}
