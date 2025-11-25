'use client'

import { ReadingModeToggle, type ReadingMode } from './ReadingModeToggle'
import { TTSPlayer } from './TTSPlayer'
import type { ReaderBlock } from '@/lib/types'

interface ReaderToolbarProps {
  blocks: ReaderBlock[]
  currentBlockIndex: number
  readingMode: ReadingMode
  onReadingModeChange: (mode: ReadingMode) => void
  onBlockChange?: (index: number) => void
}

export function ReaderToolbar({
  blocks,
  currentBlockIndex,
  readingMode,
  onReadingModeChange,
  onBlockChange,
}: ReaderToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-4">
        <TTSPlayer
          blocks={blocks}
          currentBlockIndex={currentBlockIndex}
          onBlockChange={onBlockChange}
        />
      </div>

      <div className="flex items-center gap-4">
        <ReadingModeToggle mode={readingMode} onChange={onReadingModeChange} />
      </div>
    </div>
  )
}
