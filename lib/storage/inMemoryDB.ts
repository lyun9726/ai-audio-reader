import type { Book, ReaderBlock } from '../types'

class InMemoryDB {
  private books = new Map<string, Book>()
  private blocks = new Map<string, ReaderBlock[]>()

  saveBook(book: Book): void {
    this.books.set(book.id, book)
    if (book.blocks) {
      this.blocks.set(book.id, book.blocks)
    }
  }

  getBook(bookId: string): Book | undefined {
    return this.books.get(bookId)
  }

  getBlocks(bookId: string): ReaderBlock[] {
    return this.blocks.get(bookId) || []
  }

  deleteBook(bookId: string): void {
    this.books.delete(bookId)
    this.blocks.delete(bookId)
  }

  listBooks(): Book[] {
    return Array.from(this.books.values())
  }
}

export const inMemoryDB = new InMemoryDB()

// Export convenience functions
export function saveBook(book: Book): void {
  inMemoryDB.saveBook(book)
}

export function getBook(bookId: string): Book | undefined {
  return inMemoryDB.getBook(bookId)
}

export function getBlocks(bookId: string): ReaderBlock[] {
  return inMemoryDB.getBlocks(bookId)
}
