'use client'

import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'

// Initialize PDF.js worker using local build
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

interface PdfRendererProps {
  fileUrl: string
  currentPage?: number
  onPageChange?: (page: number) => void
  onTextClick?: (text: string, pageNum: number) => void
  highlightedParagraphIndex?: number
}

export function PdfRenderer({
  fileUrl,
  currentPage = 1,
  onPageChange,
  onTextClick,
  highlightedParagraphIndex,
}: PdfRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<any>(null)

  const [pdf, setPdf] = useState<any>(null)
  const [pageNum, setPageNum] = useState(currentPage)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState<string>('')

  // 加载 PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true)
        setError('')
        console.log('[PdfRenderer] Loading PDF from:', fileUrl)

        const loadingTask = pdfjsLib.getDocument(fileUrl)
        const pdfDoc = await loadingTask.promise

        console.log('[PdfRenderer] PDF loaded successfully, pages:', pdfDoc.numPages)

        setPdf(pdfDoc)
        setNumPages(pdfDoc.numPages)
        setLoading(false)
      } catch (error: any) {
        console.error('[PdfRenderer] Error loading PDF:', error)
        setError(error.message || 'Failed to load PDF')
        setLoading(false)
      }
    }

    if (fileUrl) {
      loadPdf()
    }
  }, [fileUrl])

  // 渲染当前页
  useEffect(() => {
    if (!pdf || !canvasRef.current) return

    const renderPage = async () => {
      try {
        // Cancel any ongoing render task
        if (renderTaskRef.current) {
          console.log('[PdfRenderer] Cancelling previous render task')
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
        setRendering(false)

        // 通知父组件页码变化
        if (onPageChange) {
          onPageChange(pageNum)
        }
      } catch (error: any) {
        if (error.name === 'RenderingCancelledException') {
          console.log('[PdfRenderer] Render cancelled')
        } else {
          console.error('[PdfRenderer] Error rendering page:', error)
        }
        renderTaskRef.current = null
        setRendering(false)
      }
    }

    renderPage()

    // Cleanup function to cancel rendering on unmount or dependency change
    return () => {
      if (renderTaskRef.current) {
        console.log('[PdfRenderer] Cleanup: cancelling render task')
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [pdf, pageNum, scale])

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

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNum <= 1}
            className="p-2 hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <span className="text-sm text-slate-300">
            Page {pageNum} / {numPages}
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
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>

          <span className="text-sm text-slate-300">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="p-2 hover:bg-slate-700 rounded"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* PDF 画布 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-start justify-center bg-slate-950"
      >
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="shadow-2xl"
            style={{ maxWidth: '100%', height: 'auto' }}
          />

          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
