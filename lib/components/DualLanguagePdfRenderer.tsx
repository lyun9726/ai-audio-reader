'use client'

import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  Menu,
  Languages,
  Download,
  Volume2,
  Play,
  Pause,
} from 'lucide-react'
import { BookParagraph } from '@/lib/types'

// Initialize PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

interface DualLanguagePdfRendererProps {
  fileUrl: string
  bookId: string
  paragraphs: BookParagraph[]
  currentParaIdx: number
  isPlaying: boolean
  playbackSpeed: number
  onPlayPause: () => void
  onParagraphChange: (idx: number) => void
  onSpeedChange: (speed: number) => void
  translationCache: Map<number, string>
  onTranslateRequest: (paraIdx: number) => Promise<string>
}

export function DualLanguagePdfRenderer({
  fileUrl,
  bookId,
  paragraphs,
  currentParaIdx,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onParagraphChange,
  onSpeedChange,
  translationCache,
  onTranslateRequest,
}: DualLanguagePdfRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<any>(null)
  const loadedRef = useRef(false)

  const [pdf, setPdf] = useState<any>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState<string>('')
  const [outline, setOutline] = useState<any[]>([])
  const [showOutline, setShowOutline] = useState(false)
  const [showTranslation, setShowTranslation] = useState(true)
  const [pageText, setPageText] = useState<string>('')
  const [translatingPage, setTranslatingPage] = useState(false)
  const [playOriginalAudio, setPlayOriginalAudio] = useState(false) // Toggle between original/translated audio

  // Speed options
  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

  // Load PDF
  useEffect(() => {
    if (loadedRef.current) return

    const loadPdf = async () => {
      try {
        setLoading(true)
        setError('')
        loadedRef.current = true
        console.log('[DualLangPdf] Loading PDF from:', fileUrl)

        const loadingTask = pdfjsLib.getDocument(fileUrl)
        const pdfDoc = await loadingTask.promise

        console.log('[DualLangPdf] PDF loaded successfully, pages:', pdfDoc.numPages)

        setPdf(pdfDoc)
        setNumPages(pdfDoc.numPages)

        // Load outline
        try {
          const pdfOutline = await pdfDoc.getOutline()
          if (pdfOutline && pdfOutline.length > 0) {
            setOutline(pdfOutline)
          }
        } catch (err) {
          console.log('[DualLangPdf] Could not load outline:', err)
        }

        setLoading(false)
      } catch (error: any) {
        console.error('[DualLangPdf] Error loading PDF:', error)
        setError(error.message || 'Failed to load PDF')
        setLoading(false)
      }
    }

    if (fileUrl) {
      loadPdf()
    }
  }, [fileUrl])

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel()
          renderTaskRef.current = null
        }

        setRendering(true)

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale })

        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        renderTaskRef.current = page.render(renderContext)
        await renderTaskRef.current.promise
        renderTaskRef.current = null

        // Extract text from current page
        const textContent = await page.getTextContent()
        const extractedText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        setPageText(extractedText)

        setRendering(false)
      } catch (error: any) {
        if (error.name === 'RenderingCancelledException') {
          console.log('[DualLangPdf] Render cancelled')
        } else {
          console.error('[DualLangPdf] Error rendering page:', error)
        }
        renderTaskRef.current = null
        setRendering(false)
      }
    }

    renderPage()

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdf, pageNum, scale])

  // Find paragraph that matches current page text
  const findMatchingParagraph = (): number | null => {
    if (!pageText || paragraphs.length === 0) return null

    // Find paragraph with highest text overlap
    let bestMatch = 0
    let bestScore = 0

    for (let i = 0; i < paragraphs.length; i++) {
      const paraText = paragraphs[i].text_original || ''
      const overlap = calculateTextOverlap(pageText, paraText)
      if (overlap > bestScore) {
        bestScore = overlap
        bestMatch = i
      }
    }

    return bestScore > 0.3 ? bestMatch : null
  }

  const calculateTextOverlap = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    if (words1.length === 0 || words2.length === 0) return 0

    const set2 = new Set(words2)
    const matches = words1.filter(w => set2.has(w)).length
    return matches / Math.max(words1.length, words2.length)
  }

  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
    }
  }

  const goToNextPage = () => {
    if (pageNum < numPages) {
      setPageNum(pageNum + 1)
    }
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const goToOutlineItem = async (dest: any) => {
    if (!pdf) return

    try {
      let destArray = dest
      if (typeof dest === 'string') {
        destArray = await pdf.getDestination(dest)
      }

      if (destArray && destArray[0]) {
        const pageRef = destArray[0]
        const pageIndex = await pdf.getPageIndex(pageRef)
        setPageNum(pageIndex + 1)
        setShowOutline(false)
      }
    } catch (err) {
      console.error('[DualLangPdf] Error navigating to outline item:', err)
    }
  }

  const handleDownloadBilingual = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}/download/bilingual`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bilingual-book-${bookId}.txt`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('下载失败')
    }
  }

  const matchingParaIdx = findMatchingParagraph()
  const currentTranslation = matchingParaIdx !== null ? translationCache.get(matchingParaIdx) : null

  // Auto-translate matching paragraph
  useEffect(() => {
    if (matchingParaIdx !== null && !translationCache.has(matchingParaIdx)) {
      setTranslatingPage(true)
      onTranslateRequest(matchingParaIdx).finally(() => setTranslatingPage(false))
    }
  }, [matchingParaIdx])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-red-400 mb-4">Failed to load PDF</div>
        <div className="text-sm text-slate-400">{error}</div>
      </div>
    )
  }

  const OutlineItem = ({ item, level = 0 }: { item: any; level?: number }) => (
    <div>
      <button
        onClick={() => goToOutlineItem(item.dest)}
        className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {item.title}
      </button>
      {item.items && item.items.length > 0 && (
        <div>
          {item.items.map((subItem: any, idx: number) => (
            <OutlineItem key={idx} item={subItem} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col absolute inset-0 bg-slate-900">
      {/* Outline Sidebar */}
      {showOutline && outline.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto z-10">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">目录</h3>
          </div>
          <div className="p-2">
            {outline.map((item, index) => (
              <OutlineItem key={index} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          {outline.length > 0 && (
            <button
              onClick={() => setShowOutline(!showOutline)}
              className="p-2 hover:bg-slate-700 rounded"
              title="Toggle Table of Contents"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}

          <button
            onClick={goToPrevPage}
            disabled={pageNum <= 1}
            className="p-2 hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <span className="text-sm text-slate-300">
            {pageNum} / {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNum >= numPages}
            className="p-2 hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="p-2 hover:bg-slate-700 rounded"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>

          <span className="text-sm text-slate-300">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="p-2 hover:bg-slate-700 rounded"
            title="放大"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>

          <div className="h-6 w-px bg-slate-600 mx-2"></div>

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`p-2 hover:bg-slate-700 rounded ${showTranslation ? 'bg-blue-600' : ''}`}
            title="切换译文显示"
          >
            <Languages className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={handleDownloadBilingual}
            className="p-2 hover:bg-slate-700 rounded"
            title="下载双语版本"
          >
            <Download className="w-5 h-5 text-white" />
          </button>

          {/* Playback Speed */}
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="px-3 py-1 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="播放速度"
          >
            {speedOptions.map(speed => (
              <option key={speed} value={speed}>
                {speed}x
              </option>
            ))}
          </select>

          {/* Audio Mode Toggle */}
          {matchingParaIdx !== null && (
            <button
              onClick={() => setPlayOriginalAudio(!playOriginalAudio)}
              className={`px-3 py-1 text-xs font-medium rounded border ${
                playOriginalAudio
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
              title={playOriginalAudio ? '播放原文音频' : '播放译文音频'}
            >
              {playOriginalAudio ? '原文' : '译文'}
            </button>
          )}

          {/* Play/Pause for current paragraph */}
          {matchingParaIdx !== null && (
            <button
              onClick={onPlayPause}
              className="p-2 hover:bg-slate-700 rounded bg-blue-600"
              title={isPlaying ? '暂停' : '播放当前段落'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* PDF Canvas + Translation Overlay */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 bg-slate-950"
      >
        <div className="max-w-5xl mx-auto">
          {/* PDF Page */}
          <div className="relative bg-white shadow-2xl mx-auto" style={{ width: 'fit-content' }}>
            <canvas
              ref={canvasRef}
              className="block"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}

            {/* Progress Indicator */}
            {matchingParaIdx !== null && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                段落 {matchingParaIdx + 1} / {paragraphs.length}
              </div>
            )}
          </div>

          {/* Translation Panel Below PDF */}
          {showTranslation && (
            <div className="mt-4 bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-400 flex items-center">
                  <Languages className="w-5 h-5 mr-2" />
                  中文译文
                </h3>
                {translatingPage && (
                  <div className="flex items-center text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    翻译中...
                  </div>
                )}
              </div>

              {currentTranslation ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-200 leading-relaxed text-base">
                    {currentTranslation}
                  </p>
                </div>
              ) : matchingParaIdx !== null ? (
                <div className="text-slate-400 text-sm italic">
                  正在加载译文...
                </div>
              ) : (
                <div className="text-slate-500 text-sm italic">
                  无法识别当前页面内容，请手动翻译
                </div>
              )}

              {/* Original Text Preview (collapsed by default) */}
              {matchingParaIdx !== null && paragraphs[matchingParaIdx] && (
                <details className="mt-4">
                  <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                    查看原文
                  </summary>
                  <div className="mt-2 p-3 bg-slate-900 rounded border border-slate-700">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {paragraphs[matchingParaIdx].text_original}
                    </p>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
