import { mockBooks } from "@/data/languages"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreVertical, Play, BookOpen } from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Library</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search books..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mockBooks.map((book) => (
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
              <span>Added 2 days ago</span>
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
