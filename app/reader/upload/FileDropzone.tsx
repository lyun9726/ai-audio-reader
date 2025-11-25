'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFileDrop: (file: File) => void
}

export function FileDropzone({ onFileDrop }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFileDrop(files[0])
    }
  }, [onFileDrop])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 transition-all duration-200 text-center',
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
      )}
    >
      <svg
        className={cn(
          'mx-auto h-16 w-16 mb-4 transition-colors',
          isDragging ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
        {isDragging ? 'Drop your book here' : 'Drag & drop your book here'}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Maximum file size: 100MB
      </p>
    </div>
  )
}
