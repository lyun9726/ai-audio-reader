import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Clock, Star } from "lucide-react"
import { mockBooks } from "@/data/languages"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center py-12 bg-muted/30 rounded-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome back, Reader</h1>
        <p className="text-xl text-muted-foreground mb-8">Ready to continue your learning journey?</p>
        <div className="flex justify-center gap-4">
          <Link href="/library">
            <Button size="lg" className="gap-2">
              Go to Library <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/upload">
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              Upload New <BookOpen className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5" /> Continue Reading
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockBooks.slice(0, 3).map((book) => (
            <Link key={book.id} href={`/reader/${book.id}`} className="group">
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all bg-card">
                <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium flex items-center gap-2">
                      Resume <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[45%]"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">45% complete</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Star className="h-5 w-5" /> Recommended for You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="h-40 bg-muted rounded-md mb-4 flex items-center justify-center text-muted-foreground">
                Book Cover
              </div>
              <h3 className="font-medium">AI & The Future</h3>
              <p className="text-sm text-muted-foreground">Tech Daily</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
