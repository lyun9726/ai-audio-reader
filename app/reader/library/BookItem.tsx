'use client'

interface Book {
  id: string
  title: string
  author?: string
  lastRead?: string
  progress?: number
}

export function BookItem({ book }: { book: Book }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
      <div className="w-12 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded flex-shrink-0">
        <svg className="w-full h-full text-slate-400 p-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{book.title}</h3>
        <p className="text-sm text-slate-500 truncate">{book.author}</p>
        {book.lastRead && <p className="text-xs text-slate-400 mt-1">Last read: {book.lastRead}</p>}
      </div>
      {book.progress && (
        <div className="text-right">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{book.progress}%</span>
        </div>
      )}
    </div>
  )
}
