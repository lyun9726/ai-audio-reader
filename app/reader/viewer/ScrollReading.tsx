'use client'

import { useEffect, useRef } from 'react'

interface ScrollReadingProps {
  content: string
}

export function ScrollReading({ content }: ScrollReadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Restore scroll position (logic in Task 2)
  }, [])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}
