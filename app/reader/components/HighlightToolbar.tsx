'use client'

import { HIGHLIGHT_COLORS, type HighlightColor } from '@/lib/reader/highlightManager'

interface HighlightToolbarProps {
  onColorSelect: (color: HighlightColor) => void
  onRemove?: () => void
}

export function HighlightToolbar({ onColorSelect, onRemove }: HighlightToolbarProps) {
  const colors: HighlightColor[] = ['yellow', 'blue', 'green', 'pink']

  return (
    <div className="flex items-center gap-1 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
      {/* Color Options */}
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorSelect(color)}
          className={`w-8 h-8 rounded-md border-2 ${HIGHLIGHT_COLORS[color].bg} ${HIGHLIGHT_COLORS[color].border} hover:scale-110 transition-transform`}
          title={`Highlight ${color}`}
          aria-label={`Highlight ${color}`}
        />
      ))}

      {/* Divider */}
      {onRemove && <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />}

      {/* Remove Highlight */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
          title="Remove highlight"
          aria-label="Remove highlight"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )
}
