'use client'

import { useState } from 'react'
import type { ReaderBlock } from '@/lib/types'
import { HIGHLIGHT_COLORS, type Highlight } from '@/lib/reader/highlightManager'

interface BlockComponentProps {
  block: ReaderBlock
  highlights?: Highlight[]
  onHighlight?: () => void
  onAddNote?: () => void
  onTranslateBlock?: () => void
  isActive?: boolean
}

export function BlockComponent({
  block,
  highlights = [],
  onHighlight,
  onAddNote,
  onTranslateBlock,
  isActive,
}: BlockComponentProps) {
  const [showActions, setShowActions] = useState(false)

  if (block.type === 'image') {
    return (
      <div className="my-6">
        <img
          src={block.url}
          alt=""
          className="max-w-full h-auto rounded-lg"
        />
      </div>
    )
  }

  // Apply highlights to text
  const renderTextWithHighlights = () => {
    if (!block.text) return null

    if (highlights.length === 0) {
      return <span>{block.text}</span>
    }

    // Simple highlight rendering (no overlap handling)
    let remainingText = block.text
    const elements: JSX.Element[] = []
    let key = 0

    for (const highlight of highlights) {
      const index = remainingText.indexOf(highlight.text)
      if (index === -1) continue

      // Text before highlight
      if (index > 0) {
        elements.push(
          <span key={`text-${key++}`}>
            {remainingText.slice(0, index)}
          </span>
        )
      }

      // Highlighted text
      const colorClasses = HIGHLIGHT_COLORS[highlight.color]
      elements.push(
        <mark
          key={`highlight-${key++}`}
          className={`${colorClasses.bg} ${colorClasses.text} px-0.5 rounded`}
        >
          {highlight.text}
        </mark>
      )

      remainingText = remainingText.slice(index + highlight.text.length)
    }

    // Remaining text
    if (remainingText) {
      elements.push(
        <span key={`text-${key++}`}>{remainingText}</span>
      )
    }

    return <>{elements}</>
  }

  return (
    <div
      className={`group relative mb-6 p-4 rounded-lg transition-all ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-900/30'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Block Content */}
      <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
        {renderTextWithHighlights()}
      </p>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Highlight Button */}
          {onHighlight && (
            <button
              onClick={onHighlight}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              title="Highlight"
            >
              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 14.828l-1.414-1.414L9.172 20.485l1.414 1.414 7.071-7.071zM17.657 6.343L9.172 14.828l1.414 1.414 8.485-8.485-1.414-1.414z" />
                <path d="M3 18h4v2H3v-2zm0-4h4v2H3v-2zm0-4h4v2H3v-2z" />
              </svg>
            </button>
          )}

          {/* Note Button */}
          {onAddNote && (
            <button
              onClick={onAddNote}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              title="Add Note"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* Translate Block Button */}
          {onTranslateBlock && (
            <button
              onClick={onTranslateBlock}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
              title="Translate This Block"
            >
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
