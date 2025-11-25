'use client'

import { useState, useEffect } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'

export interface Note {
  id: string
  text: string
  blockId: string
  createdAt: number
  highlightPreview?: string
}

interface NotesPanelProps {
  bookId: string
  onNoteClick?: (note: Note) => void
}

export function NotesPanel({ bookId, onNoteClick }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Load notes from localStorage
  useEffect(() => {
    loadNotes()
  }, [bookId])

  const loadNotes = () => {
    if (typeof window === 'undefined') return

    try {
      const key = `reader:notes:${bookId}`
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data) as Note[]
        setNotes(parsed.sort((a, b) => b.createdAt - a.createdAt))
      }
    } catch (e) {
      console.error('[NotesPanel] Failed to load notes:', e)
    }
  }

  const saveNotes = (updatedNotes: Note[]) => {
    if (typeof window === 'undefined') return

    try {
      const key = `reader:notes:${bookId}`
      localStorage.setItem(key, JSON.stringify(updatedNotes))
      setNotes(updatedNotes.sort((a, b) => b.createdAt - a.createdAt))
    } catch (e) {
      console.error('[NotesPanel] Failed to save notes:', e)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingId(note.id)
    setEditText(note.text)
  }

  const handleSaveEdit = () => {
    if (!editingId) return

    const updatedNotes = notes.map(n =>
      n.id === editingId ? { ...n, text: editText } : n
    )
    saveNotes(updatedNotes)
    setEditingId(null)
    setEditText('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this note?')) return

    const updatedNotes = notes.filter(n => n.id !== id)
    saveNotes(updatedNotes)
  }

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.highlightPreview?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card variant="bordered" className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Notes ({notes.length})
        </h2>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Card
              key={note.id}
              variant="outlined"
              className="p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              onClick={() => !editingId && onNoteClick?.(note)}
            >
              {/* Highlight Preview */}
              {note.highlightPreview && (
                <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic line-clamp-2">
                    "{note.highlightPreview}"
                  </p>
                </div>
              )}

              {/* Note Text */}
              {editingId === note.id ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                      Save
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-900 dark:text-slate-100 text-sm mb-2">
                  {note.text}
                </p>
              )}

              {/* Metadata & Actions */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                {editingId !== note.id && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}

/**
 * Hook for managing notes
 */
export function useNotes(bookId: string) {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    loadNotes()
  }, [bookId])

  const loadNotes = () => {
    if (typeof window === 'undefined') return

    try {
      const key = `reader:notes:${bookId}`
      const data = localStorage.getItem(key)
      if (data) {
        setNotes(JSON.parse(data))
      }
    } catch (e) {
      console.error('[useNotes] Failed to load:', e)
    }
  }

  const addNote = (text: string, blockId: string, highlightPreview?: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      text,
      blockId,
      createdAt: Date.now(),
      highlightPreview,
    }

    const updatedNotes = [...notes, newNote]
    saveNotes(updatedNotes)
    return newNote
  }

  const updateNote = (id: string, text: string) => {
    const updatedNotes = notes.map(n =>
      n.id === id ? { ...n, text } : n
    )
    saveNotes(updatedNotes)
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id)
    saveNotes(updatedNotes)
  }

  const saveNotes = (updatedNotes: Note[]) => {
    if (typeof window === 'undefined') return

    try {
      const key = `reader:notes:${bookId}`
      localStorage.setItem(key, JSON.stringify(updatedNotes))
      setNotes(updatedNotes)
    } catch (e) {
      console.error('[useNotes] Failed to save:', e)
    }
  }

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
  }
}
