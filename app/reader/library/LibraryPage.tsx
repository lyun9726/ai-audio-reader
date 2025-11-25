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
