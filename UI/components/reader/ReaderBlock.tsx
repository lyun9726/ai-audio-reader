/**
 * Enhanced Reader Block Component
 * Integrates BlockComponent with useReaderState hook
 * Handles TTS playback, translation, highlights, and notes
 */

'use client'

import { useState } from 'react'
import { BlockComponent } from './block-component'
import { ReaderBlock as ReaderBlockType } from '../../hooks/useReaderState'

interface ReaderBlockProps {
  block: ReaderBlockType
  index: number
  isActive: boolean
  translation?: string
  onPlay: (blockId: string) => void
  onTranslate: (blockId: string) => Promise<void>
  onHighlight?: (blockId: string, color: string) => void
  onNote?: (blockId: string, content: string) => void
}

export function ReaderBlock({
  block,
  index,
  isActive,
  translation,
  onPlay,
  onTranslate,
  onHighlight,
  onNote,
}: ReaderBlockProps) {
  const [isTranslating, setIsTranslating] = useState(false)

  // Handle translation request
  const handleTranslate = async () => {
    if (isTranslating) return

    setIsTranslating(true)
    try {
      await onTranslate(block.id)
    } catch (error) {
      console.error('[ReaderBlock] Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  // Skip rendering for non-text blocks (images, headings handled separately)
  if (block.type === 'image') {
    return (
      <div className="my-8 rounded-lg overflow-hidden border border-border">
        <img
          src={block.url}
          alt={block.meta?.alt || 'Content image'}
          className="w-full h-auto"
        />
        {block.meta?.caption && (
          <p className="text-sm text-muted-foreground text-center p-3 bg-muted/30">
            {block.meta.caption}
          </p>
        )}
      </div>
    )
  }

  if (block.type === 'heading') {
    const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements
    return (
      <HeadingTag
        id={block.id}
        className={`font-bold mb-4 mt-8 ${
          block.level === 1
            ? 'text-4xl'
            : block.level === 2
              ? 'text-3xl'
              : 'text-2xl'
        }`}
      >
        {block.text}
      </HeadingTag>
    )
  }

  // Regular paragraph block
  if (!block.text) return null

  return (
    <div id={block.id} data-block-index={index}>
      <BlockComponent
        id={block.id}
        originalText={block.text}
        translation={translation}
        isActive={isActive}
        onPlay={onPlay}
        onTranslate={handleTranslate}
      />

      {/* Translation loading indicator */}
      {isTranslating && !translation && (
        <div className="text-xs text-muted-foreground italic ml-4 -mt-2 mb-2">
          Translating...
        </div>
      )}
    </div>
  )
}
