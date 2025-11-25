'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

export function FontSizeControl() {
  const [fontSize, setFontSize] = useState(16)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFontSize(s => Math.max(12, s - 2))}
        disabled={fontSize <= 12}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
        {fontSize}px
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFontSize(s => Math.min(32, s + 2))}
        disabled={fontSize >= 32}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </div>
  )
}
