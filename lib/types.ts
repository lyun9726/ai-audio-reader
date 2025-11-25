export type ReaderBlock = {
  id?: string
  order?: number
  type: 'paragraph' | 'image'
  text?: string
  url?: string
  meta?: any
}

export type ParseResult = {
  blocks: ReaderBlock[]
  metadata?: {
    title?: string
    byline?: string
    length?: number
    excerpt?: string
    siteName?: string
    sourceUrl?: string
    error?: string
  }
}

export type Book = {
  id: string
  title?: string
  sourceUrl?: string
  blocks?: ReaderBlock[]
}
