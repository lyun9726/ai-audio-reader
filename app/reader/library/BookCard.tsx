'use client'

import { Card } from '../common/Card'

interface Book {
  id: string
  title: string
  author?: string
  cover?: string
  progress?: number
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Card variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 relative">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        {book.progress && book.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
            <div className="h-full bg-blue-600" style={{ width: `${book.progress}%` }} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{book.title}</h3>
        {book.author && <p className="text-sm text-slate-500 truncate">{book.author}</p>}
      </div>
    </Card>
  )
}
