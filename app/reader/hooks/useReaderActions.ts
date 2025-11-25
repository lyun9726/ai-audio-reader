'use client'

import { useReaderStore } from '../stores/readerStore'

export function useReaderActions() {
  const setBook = useReaderStore((state) => state.setBook)
  const setBlocks = useReaderStore((state) => state.setBlocks)
  const setCurrentBlockIndex = useReaderStore((state) => state.setCurrentBlockIndex)
  const setViewMode = useReaderStore((state) => state.setViewMode)

  const loadPreview = async (url: string) => {
    try {
      const response = await fetch('/api/ingest/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, previewOnly: true }),
      })

      if (!response.ok) throw new Error('Preview failed')

      const data = await response.json()
      setBook('preview', data.title, data.blocks)

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const importBook = async (url: string) => {
    try {
      const response = await fetch('/api/reader/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) throw new Error('Import failed')

      const data = await response.json()
      return { success: true, bookId: data.bookId }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    loadPreview,
    importBook,
    setBlocks,
    setCurrentBlockIndex,
    setViewMode,
  }
}
