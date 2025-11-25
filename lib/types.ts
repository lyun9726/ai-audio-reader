export type ReaderBlock = {
  id: string
  order: number
  text: string
  meta?: any
}

export type ParseResult = {
  blocks: ReaderBlock[]
  metadata?: {
    title?: string
    author?: string
    language?: string
    error?: string
  }
}

export type Book = {
  id: string
  title?: string
  sourceUrl?: string
  blocks?: ReaderBlock[]
}
