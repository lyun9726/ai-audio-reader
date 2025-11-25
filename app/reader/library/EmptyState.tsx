import { Button } from '../common/Button'
import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className="w-24 h-24 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No books yet</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Upload your first book to get started</p>
      <Link href="/reader/upload">
        <Button variant="primary">Upload Book</Button>
      </Link>
    </div>
  )
}
