'use client'

import { useEffect, useRef } from 'react'
import { useReaderStore } from '../stores/readerStore'

export function ScrollReading() {
  const containerRef = useRef<HTMLDivElement>(null)
  const blocks = useReaderStore(state => state.blocks)
  const translationEnabled = useReaderStore(state => state.translation.enabled)
  const translatedBlocks = useReaderStore(state => state.translation.translatedBlocks)

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {blocks.map((block) => (
            <div key={block.id} className="mb-6">
              <p className="text-slate-900 dark:text-slate-100">{block.text}</p>
              {translationEnabled && translatedBlocks.has(block.id) && (
                <p className="mt-2 text-blue-600 dark:text-blue-400 text-sm">
                  {translatedBlocks.get(block.id)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
