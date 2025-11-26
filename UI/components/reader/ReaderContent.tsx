/**
 * Reader Content Component
 * Displays all reader blocks with integrated TTS and translation
 * Connects to useReaderState for state management
 */

'use client'

import { useEffect, useRef } from 'react'
import { ReaderBlock } from './ReaderBlock'
import { useReaderState, ReaderBlock as ReaderBlockType } from '../../hooks/useReaderState'

interface ReaderContentProps {
  initialUrl?: string
  initialBlocks?: ReaderBlockType[]
  className?: string
}

export function ReaderContent({ initialUrl, initialBlocks, className }: ReaderContentProps) {
  const {
    state,
    loadFromUrl,
    playBlock,
    translateBlock,
    goToBlock,
  } = useReaderState()

  const contentRef = useRef<HTMLDivElement>(null)
  const activeBlockRef = useRef<HTMLDivElement>(null)

  // Load initial content
  useEffect(() => {
    if (initialUrl) {
      loadFromUrl(initialUrl)
    } else if (initialBlocks) {
      // loadBlocks(initialBlocks) - uncomment if needed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Auto-scroll to active block
  useEffect(() => {
    if (state.autoScroll && activeBlockRef.current) {
      activeBlockRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [state.currentBlockIndex, state.autoScroll])

  // Handle block click to activate
  const handleBlockClick = (index: number) => {
    goToBlock(index)
  }

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    )
  }

  if (state.blocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <p className="text-lg text-muted-foreground">No content loaded</p>
          <p className="text-sm text-muted-foreground">
            Upload a file or enter a URL to start reading
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={contentRef}
      className={className || 'max-w-4xl mx-auto px-6 py-8 space-y-1'}
    >
      {state.blocks.map((block, index) => {
        const isActive = index === state.currentBlockIndex
        const translation = state.translationEnabled
          ? state.translations.get(block.id)
          : undefined

        return (
          <div
            key={block.id}
            ref={isActive ? activeBlockRef : null}
            onClick={() => handleBlockClick(index)}
            className="cursor-pointer"
          >
            <ReaderBlock
              block={block}
              index={index}
              isActive={isActive}
              translation={translation}
              onPlay={playBlock}
              onTranslate={translateBlock}
            />
          </div>
        )
      })}

      {/* Progress indicator */}
      <div className="sticky bottom-0 left-0 right-0 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${state.progress}%` }}
        />
      </div>
    </div>
  )
}
