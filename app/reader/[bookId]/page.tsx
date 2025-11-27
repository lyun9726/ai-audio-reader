"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BottomControlBar } from "@/components/reader/bottom-control-bar"
import { RightSidePanel } from "@/components/reader/right-side-panel"
import { BlockComponent } from "@/components/reader/block-component"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import { booksAPI, parseAPI, type Book, type ReaderBlock } from "@/lib/api-client"

export default function ReaderPage() {
  const params = useParams()
  const bookId = params.bookId as string

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [blocks, setBlocks] = useState<ReaderBlock[]>([])
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)

  useEffect(() => {
    async function loadBook() {
      try {
        setLoading(true)
        setError(null)

        // Get book metadata
        const bookData = await booksAPI.get(bookId)
        setBook(bookData)

        // Parse the book file to get content blocks
        if (bookData.file_url) {
          // If we have a file URL, we could fetch and parse it
          // For now, we'll use mock data until file parsing is fully implemented
          const mockBlocks: ReaderBlock[] = [
            {
              id: "1",
              text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.",
              type: "paragraph",
            },
            {
              id: "2",
              text: '"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."',
              type: "paragraph",
            },
            {
              id: "3",
              text: "He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.",
              type: "paragraph",
            },
          ]
          setBlocks(mockBlocks)
        }
      } catch (err) {
        console.error("Failed to load book:", err)
        setError(err instanceof Error ? err.message : "Failed to load book")
      } finally {
        setLoading(false)
      }
    }

    if (bookId) {
      loadBook()
    }
  }, [bookId])

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading book...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load book</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col relative bg-background">
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-8 py-12">
              <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold font-serif mb-2">
                  {book?.title || "Untitled Book"}
                </h1>
                {book?.author && <p className="text-muted-foreground">{book.author}</p>}
              </div>

              <div className="space-y-2">
                {blocks.map((block, i) => (
                  <BlockComponent
                    key={block.id}
                    id={block.id}
                    originalText={block.text}
                    isActive={block.id === activeBlockId}
                    onPlay={(id) => {
                      setActiveBlockId(id)
                      console.log("Play block:", id)
                    }}
                    onTranslate={(id) => {
                      console.log("Translate block:", id)
                    }}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>

          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4 z-10 shadow-md md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? "block" : "hidden"} md:block border-l`}>
          <RightSidePanel />
        </div>
      </div>

      {/* Bottom Controls */}
      <BottomControlBar />
    </div>
  )
}
