'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { BookOpen, Plus, Upload, LogOut, Loader2, Play, Trash2 } from 'lucide-react'
import { Book } from '@/lib/types'

export default function DashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      loadBooks()
    }
  }, [user, authLoading])

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId: string, bookTitle: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation to reader

    if (!confirm(`确定要删除《${bookTitle}》吗?此操作无法撤销。`)) {
      return
    }

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove book from UI
        setBooks(books.filter(book => book.id !== bookId))
        alert('书籍已删除')
      } else {
        const error = await response.json()
        alert('删除失败: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to delete book:', error)
      alert('删除失败,请重试')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">AI Audio Reader</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">My Books</h2>
          <button
            onClick={() => router.push('/upload')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Book</span>
          </button>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-4">
              <Upload className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No books yet</h3>
            <p className="text-slate-400 mb-6">Upload your first PDF or EPUB to get started</p>
            <button
              onClick={() => router.push('/upload')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Upload Your First Book</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 transition-all group"
              >
                <div
                  onClick={() => router.push(`/reader/${book.id}`)}
                  className="cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-slate-900 flex items-center justify-center">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-16 h-16 text-slate-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-sm text-slate-400 mb-2">{book.author}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span>{book.total_paragraphs} paragraphs</span>
                      <span className={`px-2 py-1 rounded ${
                        book.status === 'ready' ? 'bg-green-500/10 text-green-400' :
                        book.status === 'error' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {book.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => router.push(`/reader/${book.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    <Play className="w-4 h-4" />
                    <span>开始阅读</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteBook(book.id, book.title, e)}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                    title="删除书籍"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
