/**
 * Long Memory Store
 * In-memory store for long-document contextual memory with mock vector search
 */

/**
 * Memory entry structure
 */
export interface MemoryEntry {
  id: string
  bookId: string
  content: string
  summary: string
  mockVector: number[] // Mock embedding vector
  meta: {
    chapterTitle?: string
    blockIds?: string[]
    createdAt: number
    importance?: number
  }
}

/**
 * Memory query result
 */
export interface MemoryQueryResult {
  entry: MemoryEntry
  similarity: number
  relevance: string
}

/**
 * In-memory store class
 */
class LongMemoryStore {
  private memories: Map<string, MemoryEntry[]> = new Map()
  private vectorDimensions = 16

  /**
   * Save memory entry
   */
  save(entry: MemoryEntry): void {
    const bookMemories = this.memories.get(entry.bookId) || []
    bookMemories.push(entry)
    this.memories.set(entry.bookId, bookMemories)
  }

  /**
   * Save multiple entries
   */
  saveMany(entries: MemoryEntry[]): void {
    entries.forEach(entry => this.save(entry))
  }

  /**
   * Get all memories for a book
   */
  getBookMemories(bookId: string): MemoryEntry[] {
    return this.memories.get(bookId) || []
  }

  /**
   * Query memories by text (mock vector search)
   */
  query(
    bookId: string,
    queryText: string,
    topK: number = 5
  ): MemoryQueryResult[] {
    const bookMemories = this.getBookMemories(bookId)
    if (bookMemories.length === 0) {
      return []
    }

    // Generate mock vector for query
    const queryVector = this.textToMockVector(queryText)

    // Calculate similarity for each memory
    const results: MemoryQueryResult[] = bookMemories.map(entry => {
      const similarity = this.cosineSimilarity(queryVector, entry.mockVector)
      const relevance = this.calculateRelevance(similarity)

      return {
        entry,
        similarity,
        relevance,
      }
    })

    // Sort by similarity and return top K
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
  }

  /**
   * Clear all memories for a book
   */
  clearBook(bookId: string): void {
    this.memories.delete(bookId)
  }

  /**
   * Clear all memories
   */
  clearAll(): void {
    this.memories.clear()
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalBooks: number
    totalMemories: number
    memoriesPerBook: Record<string, number>
  } {
    const memoriesPerBook: Record<string, number> = {}

    this.memories.forEach((entries, bookId) => {
      memoriesPerBook[bookId] = entries.length
    })

    return {
      totalBooks: this.memories.size,
      totalMemories: Array.from(this.memories.values()).reduce(
        (sum, entries) => sum + entries.length,
        0
      ),
      memoriesPerBook,
    }
  }

  /**
   * Convert text to mock vector (deterministic)
   */
  private textToMockVector(text: string): number[] {
    const vector = new Array(this.vectorDimensions).fill(0)
    const normalized = text.toLowerCase().trim()

    for (let dim = 0; dim < this.vectorDimensions; dim++) {
      let value = 0

      // Different hash strategy for each dimension
      for (let i = 0; i < normalized.length; i++) {
        const charCode = normalized.charCodeAt(i)
        value += charCode * (i + dim + 1)
      }

      // Normalize to [-1, 1]
      vector[dim] = Math.sin(value / 1000)
    }

    // L2 normalize
    return this.l2Normalize(vector)
  }

  /**
   * L2 normalization
   */
  private l2Normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    )

    if (magnitude === 0) return vector

    return vector.map(val => val / magnitude)
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }

    const magnitude = Math.sqrt(magnitudeA * magnitudeB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
  }

  /**
   * Calculate relevance label from similarity score
   */
  private calculateRelevance(similarity: number): string {
    if (similarity > 0.8) return 'high'
    if (similarity > 0.5) return 'medium'
    return 'low'
  }
}

// Global instance
let memoryStore: LongMemoryStore | null = null

/**
 * Get or create memory store instance
 */
export function getMemoryStore(): LongMemoryStore {
  if (!memoryStore) {
    memoryStore = new LongMemoryStore()
  }
  return memoryStore
}

/**
 * Reset memory store (for testing)
 */
export function resetMemoryStore(): void {
  memoryStore = null
}

/**
 * Create memory entry from content
 */
export function createMemoryEntry(
  bookId: string,
  content: string,
  summary: string,
  meta?: Partial<MemoryEntry['meta']>
): MemoryEntry {
  const store = getMemoryStore()

  // Generate mock vector
  const mockVector = (store as any).textToMockVector(content)

  return {
    id: `memory-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    bookId,
    content,
    summary,
    mockVector,
    meta: {
      createdAt: Date.now(),
      ...meta,
    },
  }
}

/**
 * Remember book content (save to memory store)
 */
export async function rememberBook(
  bookId: string,
  content: string,
  summary: string,
  meta?: Partial<MemoryEntry['meta']>
): Promise<MemoryEntry> {
  const store = getMemoryStore()
  const entry = createMemoryEntry(bookId, content, summary, meta)
  store.save(entry)
  return entry
}

/**
 * Query book memory
 */
export async function queryBookMemory(
  bookId: string,
  question: string,
  topK: number = 5
): Promise<MemoryQueryResult[]> {
  const store = getMemoryStore()
  return store.query(bookId, question, topK)
}
