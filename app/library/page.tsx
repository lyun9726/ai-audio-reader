"use client"

import { useState, useEffect } from "react"
import { booksAPI, type Book } from "@/lib/api-client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreVertical, Play, BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true)
        const data = await booksAPI.list()
        setBooks(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load books:", err)
        // Use mock data if API fails
        const mockBooks: Book[] = [
          {
            id: "1",
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            cover: "/placeholder.svg?height=300&width=200&text=Gatsby",
            format: "epub",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            title: "1984",
            author: "George Orwell",
            cover: "/placeholder.svg?height=300&width=200&text=1984",
            format: "pdf",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            title: "Thinking, Fast and Slow",
            author: "Daniel Kahneman",
            cover: "/placeholder.svg?height=300&width=200&text=Thinking",
            format: "epub",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "4",
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            cover: "/placeholder.svg?height=300&width=200&text=Mockingbird",
            format: "epub",
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "5",
            title: "The Catcher in the Rye",
            author: "J.D. Salinger",
            cover: "/placeholder.svg?height=300&width=200&text=Catcher",
            format: "pdf",
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
        setBooks(mockBooks)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Library</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="font-semibold">Error loading books</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "No books found matching your search." : "No books in your library yet. Upload some books to get started!"}
          </p>
          {!searchQuery && (
            <Link href="/upload" className="inline-block mt-4">
              <Button>Upload Your First Book</Button>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="group overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="aspect-[2/3] bg-muted relative overflow-hidden">
              <img
                src={book.cover || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                <Link href={`/reader/${book.id}`} className="w-full">
                  <Button size="sm" className="w-full gap-2" variant="secondary">
                    <BookOpen className="h-4 w-4" /> Read
                  </Button>
                </Link>
                <Button size="sm" className="w-full gap-2" variant="secondary">
                  <Play className="h-4 w-4" /> Listen
                </Button>
              </div>
            </div>
            <CardContent className="p-4 flex-1">
              <h3 className="font-semibold line-clamp-1" title={book.title}>
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
              <span>
                {book.format && book.format.toUpperCase()}
                {book.created_at && ` • ${new Date(book.created_at).toLocaleDateString()}`}
              </span>
              <button className="hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
