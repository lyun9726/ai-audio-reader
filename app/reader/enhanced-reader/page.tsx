'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useReaderStore } from '../stores/readerStore'
import { useReadingProgress, useAutoSaveProgress } from '@/lib/reader/useReadingProgress'
import { useReadingMode } from '../components/ReadingModeToggle'
import { useNotes, type Note } from '../components/NotesPanel'
import { ReaderToolbar } from '../components/ReaderToolbar'
import { AIActionFloat } from '../components/AIActionFloat'
import { AISidebar } from '../ai/AISidebar'
import { BlockComponent } from '../components/BlockComponent'
import { SelectionPortal } from '../components/SelectionPortal'
import { InlineDictionary } from '../components/InlineDictionary'
import { InlineTranslator } from '../components/InlineTranslator'
import { HighlightToolbar } from '../components/HighlightToolbar'
import { NotesPanel } from '../components/NotesPanel'
import {
  loadHighlights,
  addHighlight,
  getBlockHighlights,
  type HighlightColor,
  type Highlight,
} from '@/lib/reader/highlightManager'

type SelectionMode = 'word' | 'phrase' | 'highlight' | null

export default function EnhancedReaderPage() {
  const params = useParams()
  const bookId = params?.bookId as string

  const blocks = useReaderStore(state => state.blocks)
  const currentBlockIndex = useReaderStore(state => state.currentBlockIndex)
  const setCurrentBlockIndex = useReaderStore(state => state.setCurrentBlockIndex)

  const { getProgress, updateProgress } = useReadingProgress(bookId)
  const { mode, setMode } = useReadingMode()
  const { notes, addNote } = useNotes(bookId)

  const [selectedText, setSelectedText] = useState('')
  const [selectedWord, setSelectedWord] = useState('')
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [highlights, setHighlights] = useState<Highlight[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const hasRestoredProgress = useRef(false)

  // Auto-save progress
  useAutoSaveProgress(bookId, currentBlockIndex)

  // Load highlights on mount
  useEffect(() => {
    if (bookId) {
      const loaded = loadHighlights(bookId)
      setHighlights(loaded)
    }
  }, [bookId])

  // Restore progress on mount
  useEffect(() => {
    if (hasRestoredProgress.current || !bookId) return

    const progress = getProgress()
    if (progress) {
      setCurrentBlockIndex(progress.index)

      if (progress.scrollY !== undefined) {
        setTimeout(() => {
          window.scrollTo({
            top: progress.scrollY,
            behavior: 'instant' as ScrollBehavior,
          })
        }, 100)
      }
    }

    hasRestoredProgress.current = true
  }, [bookId, getProgress, setCurrentBlockIndex])

  // Update progress on block change
  useEffect(() => {
    if (hasRestoredProgress.current) {
      updateProgress(currentBlockIndex)
    }
  }, [currentBlockIndex, updateProgress])

  // Track text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      if (!text) {
        setSelectionMode(null)
        setSelectedText('')
        setSelectedWord('')
        return
      }

      setSelectedText(text)

      // Determine if single word or phrase
      const words = text.split(/\s+/)
      if (words.length === 1) {
        setSelectedWord(text)
        setSelectionMode('word')
      } else {
        setSelectionMode('phrase')
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  // ESC key handler for focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'focus') {
          setMode('light')
        } else if (selectionMode) {
          window.getSelection()?.removeAllRanges()
          setSelectionMode(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, setMode, selectionMode])

  const isFocusMode = mode === 'focus'

  // AI Action handlers
  const handleAsk = () => {
    setShowSidebar(true)
    setShowNotesPanel(false)
  }

  const handleSummary = () => {
    setShowSidebar(true)
    setShowNotesPanel(false)
  }

  const handleExplain = () => {
    if (!selectedText) {
      alert('Please select text first')
      return
    }
    setShowSidebar(true)
    setShowNotesPanel(false)
  }

  const handleMindmap = () => {
    setShowSidebar(true)
    setShowNotesPanel(false)
  }

  // Selection handlers
  const handleExplainWord = (word: string) => {
    console.log('[Reader] Explaining word:', word)
    handleExplain()
  }

  const handleTranslateText = (text: string) => {
    console.log('[Reader] Translating:', text)
    handleExplain()
  }

  const handleCopyText = () => {
    console.log('[Reader] Copied:', selectedText)
  }

  const handleHighlight = (color: HighlightColor) => {
    if (!selectedText || !blocks[currentBlockIndex]) return

    const block = blocks[currentBlockIndex]
    const newHighlight = addHighlight(
      bookId,
      block.id || `block-${currentBlockIndex}`,
      selectedText,
      color
    )

    setHighlights(prev => [...prev, newHighlight])
    window.getSelection()?.removeAllRanges()
    setSelectionMode(null)
  }

  // Block actions
  const handleBlockHighlight = (blockIndex: number) => {
    setCurrentBlockIndex(blockIndex)
    setSelectionMode('highlight')
  }

  const handleAddNote = (blockIndex: number) => {
    const noteText = prompt('Enter your note:')
    if (!noteText) return

    const block = blocks[blockIndex]
    addNote(noteText, block.id || `block-${blockIndex}`, block.text?.slice(0, 100))
    setShowNotesPanel(true)
  }

  const handleTranslateBlock = (blockIndex: number) => {
    console.log('[Reader] Translating block:', blockIndex)
    handleExplain()
  }

  const handleNoteClick = (note: Note) => {
    // Find block and scroll to it
    const blockIndex = blocks.findIndex(b => (b.id || `block-${blocks.indexOf(b)}`) === note.blockId)
    if (blockIndex !== -1) {
      setCurrentBlockIndex(blockIndex)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Toolbar (hidden in focus mode) */}
      {!isFocusMode && (
        <ReaderToolbar
          blocks={blocks}
          currentBlockIndex={currentBlockIndex}
          readingMode={mode}
          onReadingModeChange={setMode}
          onBlockChange={setCurrentBlockIndex}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Reader Content */}
        <div
          ref={containerRef}
          className={`flex-1 overflow-y-auto transition-all ${
            isFocusMode ? 'max-w-4xl mx-auto' : ''
          }`}
        >
          <div className="max-w-3xl mx-auto px-8 py-12">
            {blocks.map((block, index) => (
              <BlockComponent
                key={block.id || index}
                block={block}
                highlights={getBlockHighlights(
                  bookId,
                  block.id || `block-${index}`
                )}
                onHighlight={() => handleBlockHighlight(index)}
                onAddNote={() => handleAddNote(index)}
                onTranslateBlock={() => handleTranslateBlock(index)}
                isActive={index === currentBlockIndex}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar (hidden in focus mode) */}
        {!isFocusMode && (
          <div className="w-96 border-l border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
            {/* Sidebar Toggle */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowSidebar(true)
                  setShowNotesPanel(false)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  showSidebar && !showNotesPanel
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                AI Assistant
              </button>
              <button
                onClick={() => {
                  setShowNotesPanel(true)
                  setShowSidebar(false)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  showNotesPanel
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Notes ({notes.length})
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {showNotesPanel ? (
                <NotesPanel bookId={bookId} onNoteClick={handleNoteClick} />
              ) : (
                <AISidebar />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selection Portals */}
      {selectionMode === 'word' && selectedWord && (
        <SelectionPortal isVisible={true}>
          <InlineDictionary
            word={selectedWord}
            onExplain={handleExplainWord}
            onClose={() => {
              window.getSelection()?.removeAllRanges()
              setSelectionMode(null)
            }}
          />
        </SelectionPortal>
      )}

      {selectionMode === 'phrase' && selectedText && (
        <SelectionPortal isVisible={true}>
          <InlineTranslator
            text={selectedText}
            onTranslate={handleTranslateText}
            onCopy={handleCopyText}
          />
        </SelectionPortal>
      )}

      {(selectionMode === 'highlight' || (selectionMode && selectedText)) && (
        <SelectionPortal isVisible={true}>
          <HighlightToolbar onColorSelect={handleHighlight} />
        </SelectionPortal>
      )}

      {/* AI Floating Button (hidden in focus mode) */}
      {!isFocusMode && (
        <AIActionFloat
          selectedText={selectedText}
          onAsk={handleAsk}
          onSummary={handleSummary}
          onExplain={handleExplain}
          onMindmap={handleMindmap}
        />
      )}

      {/* Focus Mode Hint */}
      {isFocusMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 bg-slate-900/90 text-white text-sm rounded-full shadow-lg">
            Press ESC to exit focus mode
          </div>
        </div>
      )}
    </div>
  )
}
