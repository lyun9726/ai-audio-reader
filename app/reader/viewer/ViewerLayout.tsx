'use client'

import { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { ReadingToolbar } from './ReadingToolbar'
import { ProgressBar } from './ProgressBar'

interface ViewerLayoutProps {
  children: ReactNode
  bookTitle: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ViewerLayout({ children, bookTitle, currentPage, totalPages, onPageChange }: ViewerLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
      <TopBar title={bookTitle} />
      <ProgressBar current={currentPage} total={totalPages} onChange={onPageChange} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <ReadingToolbar />
    </div>
  )
}
