"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Clock, Star, Upload, Mic, Layout, Sparkles, Loader2 } from 'lucide-react'
import { booksAPI, type Book } from "@/lib/api-client"

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await booksAPI.list()
        setBooks(data.slice(0, 3)) // Only show first 3 books
      } catch (err) {
        console.error("Failed to load books:", err)
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [])

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background border-b border-border/40 pb-16 pt-12 sm:pt-20 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur-sm mb-6">
              <Sparkles className="mr-2 h-3.5 w-3.5 fill-primary text-primary" />
              <span>New AI Analysis Features Available</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Read smarter, not harder.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
              Transform any document into an interactive learning experience with AI-powered translation, voices, and insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/library">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-sm hover:shadow-md transition-all">
                  Go to Library
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium bg-background/50 backdrop-blur-sm border-border/60 hover:bg-secondary/60">
                  <Upload className="mr-2 h-4 w-4" /> Upload Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent rounded-full blur-3xl transform -translate-y-1/4" />
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/10 via-transparent to-transparent rounded-full blur-3xl transform translate-y-1/4" />
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Continue Reading Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" /> Continue Reading
            </h2>
            <Link href="/library" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No books in your library yet.</p>
              <Link href="/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload Your First Book
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
              <Link key={book.id} href={`/reader/${book.id}`} className="group block">
                <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-[2/1] relative bg-muted flex items-center justify-center overflow-hidden">
                    {book.cover ? (
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-gray-500/10">
                        {book.format?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      {book.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(book.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{book.author || 'Unknown Author'}</p>

                    {book.progress !== undefined && (
                      <div className="mt-auto pt-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.round(book.progress * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${book.progress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )}
        </section>

        {/* Features Grid */}
        <section>
           <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Explore Features</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { icon: Mic, title: "Voice Cloning", desc: "Create your own AI narrator", href: "/voices", color: "text-blue-500" },
               { icon: Layout, title: "Web Reader", desc: "Read any URL cleanly", href: "/web-reader", color: "text-purple-500" },
               { icon: Sparkles, title: "AI Mindmap", desc: "Visualize book concepts", href: "/mindmap", color: "text-amber-500" },
               { icon: Upload, title: "Upload Files", desc: "PDF, EPUB, TXT support", href: "/upload", color: "text-green-500" },
             ].map((feature, i) => (
               <Link key={i} href={feature.href} className="group">
                 <div className="bg-card hover:bg-secondary/50 border border-border/50 rounded-xl p-6 transition-all duration-200 hover:scale-[1.02]">
                   <div className={`h-10 w-10 rounded-lg bg-background flex items-center justify-center mb-4 shadow-sm ${feature.color}`}>
                     <feature.icon className="h-5 w-5" />
                   </div>
                   <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                   <p className="text-sm text-muted-foreground">{feature.desc}</p>
                 </div>
               </Link>
             ))}
           </div>
        </section>

        {/* Recommended Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-muted-foreground" /> Recommended
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[2/3] bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden mb-3 relative">
                  <div className="absolute inset-0 bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:scale-105 transition-transform duration-500">
                    <BookOpen className="h-12 w-12 opacity-20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <Button size="sm" className="w-full bg-white/90 text-black hover:bg-white border-none">
                      Read Now
                    </Button>
                  </div>
                </div>
                <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">The Psychology of Money</h3>
                <p className="text-sm text-muted-foreground">Morgan Housel</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
