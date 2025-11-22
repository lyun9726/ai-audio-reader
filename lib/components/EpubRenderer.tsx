'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ePub, { Book, Rendition } from 'epubjs'
import { ChevronLeft, ChevronRight, Menu, Loader2, Type, Palette } from 'lucide-react'

interface EpubRendererProps {
  fileUrl: string
  onLocationChange?: (location: string) => void
  onTextSelect?: (text: string) => void
}

export function EpubRenderer({
  fileUrl,
  onLocationChange,
  onTextSelect,
}: EpubRendererProps) {
  const loadedRef = useRef(false)
  const [viewerElement, setViewerElement] = useState<HTMLDivElement | null>(null)

  const [book, setBook] = useState<Book | null>(null)
  const [rendition, setRendition] = useState<Rendition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [currentLocation, setCurrentLocation] = useState('')
  const [toc, setToc] = useState<any[]>([])
  const [showToc, setShowToc] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Callback ref to get the viewer element when it's mounted
  const viewerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      console.log('[EpubRenderer] viewerRef callback - element is ready')
      setViewerElement(node)
    }
  }, [])

  // 加载 EPUB when viewerElement is available
  useEffect(() => {
    if (!fileUrl) {
      console.log('[EpubRenderer] Missing fileUrl')
      return
    }

    if (!viewerElement) {
      console.log('[EpubRenderer] Viewer element not ready yet')
      return
    }

    if (loadedRef.current) {
      console.log('[EpubRenderer] Already loaded, skipping')
      return
    }

    console.log('[EpubRenderer] Starting EPUB load...')

    const loadEpub = async () => {
      try {
        setLoading(true)
        setError('')
        loadedRef.current = true
        console.log('[EpubRenderer] Loading EPUB from:', fileUrl)

        // Create EPUB book with options
        const epubBook = ePub(fileUrl, {
          openAs: 'epub',
          requestCredentials: false,
        })
        setBook(epubBook)

        console.log('[EpubRenderer] EPUB book created, waiting for ready...')

        // Wait for book to be ready
        await epubBook.ready
        console.log('[EpubRenderer] EPUB book ready, rendering...')

        // Get container dimensions
        const containerWidth = viewerElement.clientWidth
        const containerHeight = viewerElement.clientHeight
        console.log('[EpubRenderer] Container dimensions:', containerWidth, 'x', containerHeight)

        // 渲染到容器 - epubjs needs explicit pixel dimensions
        const epubRendition = epubBook.renderTo(viewerElement, {
          width: containerWidth || 800,
          height: containerHeight || 600,
          flow: 'paginated',
          allowScriptedContent: true,
        })

        setRendition(epubRendition)
        console.log('[EpubRenderer] Rendition created, displaying...')

        // 显示第一章
        await epubRendition.display()
        console.log('[EpubRenderer] EPUB displayed successfully')

        // 加载目录
        console.log('[EpubRenderer] Loading navigation...')
        const navigation = await epubBook.loaded.navigation
        setToc(navigation.toc)
        console.log('[EpubRenderer] Table of contents loaded:', navigation.toc.length, 'chapters')

        // 应用主题
        if (theme === 'dark') {
          epubRendition.themes.default({
            body: {
              background: '#0f172a !important',
              color: '#e2e8f0 !important',
            },
          })
        }

        setLoading(false)
        console.log('[EpubRenderer] EPUB fully loaded and ready')

        // 监听位置变化
        epubRendition.on('relocated', (location: any) => {
          const cfi = location.start.cfi
          setCurrentLocation(cfi)

          if (onLocationChange) {
            onLocationChange(cfi)
          }
        })

        // 监听文本选择
        epubRendition.on('selected', (cfiRange: string, contents: any) => {
          const selection = contents.window.getSelection()
          const text = selection?.toString()

          if (text && onTextSelect) {
            onTextSelect(text)
          }
        })
      } catch (error: any) {
        console.error('[EpubRenderer] Error loading EPUB:', error)
        setError(error.message || 'Failed to load EPUB')
        setLoading(false)
      }
    }

    loadEpub()

    // 清理
    return () => {
      if (rendition) {
        rendition.destroy()
      }
    }
  }, [fileUrl, viewerElement, onLocationChange, onTextSelect, theme])

  // 应用主题
  useEffect(() => {
    if (!rendition) return

    if (theme === 'dark') {
      rendition.themes.default({
        body: {
          background: '#0f172a !important',
          color: '#e2e8f0 !important',
        },
        p: {
          color: '#e2e8f0 !important',
        },
        a: {
          color: '#60a5fa !important',
        },
      })
    } else {
      rendition.themes.default({
        body: {
          background: '#ffffff !important',
          color: '#1e293b !important',
        },
      })
    }
  }, [theme, rendition])

  // 应用字体大小
  useEffect(() => {
    if (!rendition) return

    rendition.themes.fontSize(`${fontSize}%`)
  }, [fontSize, rendition])

  // Handle window resize
  useEffect(() => {
    if (!rendition || !viewerElement) return

    const handleResize = () => {
      const width = viewerElement.clientWidth
      const height = viewerElement.clientHeight
      console.log('[EpubRenderer] Resizing to:', width, 'x', height)
      rendition.resize(width, height)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [rendition, viewerElement])

  const goToPrev = () => {
    rendition?.prev()
  }

  const goToNext = () => {
    rendition?.next()
  }

  const goToChapter = (href: string) => {
    rendition?.display(href)
    setShowToc(false)
  }

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 10, 200))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 10, 50))
  }

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 p-8">
        <div className="text-red-400 mb-4">Failed to load EPUB</div>
        <div className="text-sm text-slate-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex absolute inset-0 bg-slate-900">
      {/* 目录侧边栏 */}
      {showToc && (
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white">Table of Contents</h3>
          </div>
          <div className="p-2">
            {toc.map((item, index) => (
              <button
                key={index}
                onClick={() => goToChapter(item.href)}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowToc(!showToc)}
              className="p-2 hover:bg-slate-700 rounded"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={goToPrev}
              className="p-2 hover:bg-slate-700 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={goToNext}
              className="p-2 hover:bg-slate-700 rounded"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* 字体大小 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={decreaseFontSize}
                className="p-2 hover:bg-slate-700 rounded"
                title="Decrease font size"
              >
                <Type className="w-4 h-4 text-white" />
              </button>
              <span className="text-sm text-slate-300">{fontSize}%</span>
              <button
                onClick={increaseFontSize}
                className="p-2 hover:bg-slate-700 rounded"
                title="Increase font size"
              >
                <Type className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* 主题切换 */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-700 rounded"
              title="Toggle theme"
            >
              <Palette className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* EPUB 查看器 */}
        <div
          ref={viewerRef}
          className="flex-1 overflow-hidden relative"
          style={{ background: theme === 'dark' ? '#0f172a' : '#ffffff' }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
