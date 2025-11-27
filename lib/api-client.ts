/**
 * Unified API Client for Frontend
 * Connects UI2 components to backend APIs
 */

// Types
export interface Book {
  id: string
  title: string
  author?: string
  cover?: string
  file_url?: string
  format?: 'pdf' | 'epub' | 'txt'
  created_at?: string
  progress?: number
}

export interface ReaderBlock {
  id: string
  text: string
  type?: 'paragraph' | 'heading' | 'image'
  order?: number
  meta?: any
}

export interface ParseResult {
  blocks: ReaderBlock[]
  metadata?: {
    title?: string
    author?: string
  }
}

// Books API
export const booksAPI = {
  /**
   * Get all books
   */
  async list(): Promise<Book[]> {
    const res = await fetch('/api/books')
    if (!res.ok) throw new Error('Failed to fetch books')
    const data = await res.json()
    return data.books || []
  },

  /**
   * Upload a new book
   */
  async upload(file: File): Promise<{ bookId: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/books/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },

  /**
   * Get book details
   */
  async get(bookId: string): Promise<Book> {
    const res = await fetch(`/api/books/${bookId}`)
    if (!res.ok) throw new Error('Failed to fetch book')
    const data = await res.json()
    return data.book
  },

  /**
   * Delete a book
   */
  async delete(bookId: string): Promise<void> {
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete book')
  },

  /**
   * Get book paragraphs/blocks
   */
  async getParagraphs(bookId: string): Promise<ReaderBlock[]> {
    const res = await fetch(`/api/books/${bookId}/paragraphs`)
    if (!res.ok) throw new Error('Failed to fetch paragraphs')
    const data = await res.json()

    // Convert backend paragraph format to ReaderBlock format
    return data.paragraphs.map((p: any) => ({
      id: p.id || p.para_idx?.toString(),
      text: p.content || p.text,
      type: 'paragraph',
      order: p.para_idx,
      meta: p
    }))
  },
}

// Parse API
export const parseAPI = {
  /**
   * Parse URL to extract content
   */
  async fromUrl(url: string): Promise<ParseResult> {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    if (!res.ok) throw new Error('Failed to parse URL')
    return res.json()
  },

  /**
   * Parse uploaded file
   */
  async fromFile(file: File): Promise<ParseResult> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/parse', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error('Failed to parse file')
    return res.json()
  },
}

// AI API
export const aiAPI = {
  /**
   * Generate summary
   */
  async summary(blocks: ReaderBlock[], level: 'short' | 'detailed' = 'short'): Promise<string> {
    const res = await fetch('/api/ai/deepsummary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: blocks.map(b => ({ type: b.type, text: b.text })),
        level,
      }),
    })

    if (!res.ok) throw new Error('Summary generation failed')
    const data = await res.json()
    return data.summary
  },

  /**
   * Ask question about content
   */
  async qa(question: string, context: ReaderBlock[]): Promise<string> {
    const res = await fetch('/api/ai/query-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: question,
        context: context.map(b => b.text).join('\n'),
      }),
    })

    if (!res.ok) throw new Error('Q&A failed')
    const data = await res.json()
    return data.answer
  },

  /**
   * Generate mindmap
   */
  async mindmap(blocks: ReaderBlock[]): Promise<any> {
    const res = await fetch('/api/ai/mindmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: blocks.map(b => ({ text: b.text })),
      }),
    })

    if (!res.ok) throw new Error('Mindmap generation failed')
    return res.json()
  },

  /**
   * Explain selected text
   */
  async explain(text: string, context?: string): Promise<string> {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context }),
    })

    if (!res.ok) throw new Error('Explanation failed')
    const data = await res.json()
    return data.explanation
  },
}

// Translation API
export const translationAPI = {
  /**
   * Translate text
   */
  async translate(text: string, targetLang: string = 'zh'): Promise<string> {
    const res = await fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: '1', text }],
        targetLang,
      }),
    })

    if (!res.ok) throw new Error('Translation failed')
    const data = await res.json()
    return data.results[0]?.translated || text
  },

  /**
   * Batch translate blocks
   */
  async translateBlocks(blocks: ReaderBlock[], targetLang: string = 'zh'): Promise<Map<string, string>> {
    const res = await fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: blocks.map(b => ({ id: b.id, text: b.text })),
        targetLang,
      }),
    })

    if (!res.ok) throw new Error('Batch translation failed')
    const data = await res.json()

    const translations = new Map<string, string>()
    data.results.forEach((r: any) => {
      translations.set(r.id, r.translated)
    })
    return translations
  },
}

// TTS API
export const ttsAPI = {
  /**
   * Synthesize speech
   */
  async synthesize(text: string, options?: {
    voiceId?: string
    rate?: number
    pitch?: number
  }): Promise<{ audioUrl: string }> {
    const res = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: '1', text }],
        ...options,
      }),
    })

    if (!res.ok) throw new Error('TTS synthesis failed')
    return res.json()
  },
}
