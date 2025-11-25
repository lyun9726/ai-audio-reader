'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

interface PaginatedReadingProps {
  content: string
}

export function PaginatedReading({ content }: PaginatedReadingProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10 // Mock, real logic in Task 2

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center px-8">
          <div className="max-w-3xl w-full">
            <div
              className="prose prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
