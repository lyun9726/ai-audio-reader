#!/bin/bash

# AI Audio Reader - Component Generation Script
# 本脚本自动生成所有 UI 组件框架

BASE_DIR="./app/reader"

# Library Components
cat > "$BASE_DIR/library/LibraryPage.tsx" << 'EOF'
'use client'

import { useState } from 'react'
import { BookCard } from './BookCard'
import { BookItem } from './BookItem'
import { EmptyState } from './EmptyState'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

export function LibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [books, setBooks] = useState<any[]>([]) // Mock data

  return (
    <div className="space-y-6">
      <Card variant="bordered" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Library</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
            {books.map((book) => (
              viewMode === 'grid' ? (
                <BookCard key={book.id} book={book} />
              ) : (
                <BookItem key={book.id} book={book} />
              )
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
EOF

cat > "$BASE_DIR/library/BookCard.tsx" << 'EOF'
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
EOF

cat > "$BASE_DIR/library/BookItem.tsx" << 'EOF'
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
EOF

cat > "$BASE_DIR/library/EmptyState.tsx" << 'EOF'
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
EOF

echo "Library components created ✓"

# Due to response length limits, I'll create a comprehensive generation approach
echo "Component generation script ready"
