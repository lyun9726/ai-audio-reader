'use client'

import { useState } from 'react'
import { ScrollReading } from './ScrollReading'
import { PaginatedReading } from './PaginatedReading'
import { Tabs } from '../common/Tabs'

interface ReadingPanelProps {
  content: string
}

export function ReadingPanel({ content }: ReadingPanelProps) {
  const [mode, setMode] = useState<'scroll' | 'paginated'>('scroll')

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-2">
        <Tabs
          tabs={[
            { id: 'scroll', label: 'Scroll' },
            { id: 'paginated', label: 'Paginated' }
          ]}
          defaultTab={mode}
        >
          {(activeTab) => {
            setMode(activeTab as 'scroll' | 'paginated')
            return null
          }}
        </Tabs>
      </div>
      <div className="flex-1 overflow-hidden">
        {mode === 'scroll' ? (
          <ScrollReading content={content} />
        ) : (
          <PaginatedReading content={content} />
        )}
      </div>
    </div>
  )
}
