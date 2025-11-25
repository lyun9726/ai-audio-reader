/**
 * Vector Store Stub
 * In-memory vector store for embeddings with similarity search
 */

import type { VectorItem } from '@/lib/pipeline/types'
import { SimpleVectorizer } from '@/lib/pipeline/vector/simpleVectorizer'

/**
 * Query result with similarity score
 */
export interface VectorQueryResult {
  item: VectorItem
  similarity: number
}

/**
 * Vector store interface
 */
export interface VectorStore {
  save(vectors: VectorItem[]): void
  saveOne(vector: VectorItem): void
  get(id: string): VectorItem | undefined
  getAll(): VectorItem[]
  queryByText(text: string, topK?: number): VectorQueryResult[]
  queryByVector(embedding: number[], topK?: number): VectorQueryResult[]
  clear(): void
  count(): number
}

/**
 * In-memory vector store implementation
 */
export class InMemoryVectorStore implements VectorStore {
  private vectors: Map<string, VectorItem> = new Map()
  private vectorizer: SimpleVectorizer

  constructor() {
    this.vectorizer = new SimpleVectorizer()
  }

  /**
   * Save multiple vectors
   */
  save(vectors: VectorItem[]): void {
    for (const vector of vectors) {
      this.vectors.set(vector.id, vector)
    }
  }

  /**
   * Save a single vector
   */
  saveOne(vector: VectorItem): void {
    this.vectors.set(vector.id, vector)
  }

  /**
   * Get vector by ID
   */
  get(id: string): VectorItem | undefined {
    return this.vectors.get(id)
  }

  /**
   * Get all vectors
   */
  getAll(): VectorItem[] {
    return Array.from(this.vectors.values())
  }

  /**
   * Query by text - converts text to vector and finds similar vectors
   */
  queryByText(text: string, topK: number = 5): VectorQueryResult[] {
    if (!text || text.trim().length === 0) {
      return []
    }

    // Generate embedding for query text
    const queryEmbedding = this.generateEmbedding(text)

    // Find similar vectors
    return this.queryByVector(queryEmbedding, topK)
  }

  /**
   * Query by vector embedding - finds most similar vectors
   */
  queryByVector(embedding: number[], topK: number = 5): VectorQueryResult[] {
    if (!embedding || embedding.length === 0) {
      return []
    }

    const results: VectorQueryResult[] = []

    // Calculate similarity for all vectors
    for (const vector of this.vectors.values()) {
      if (!vector.embedding) {
        continue
      }

      const similarity = SimpleVectorizer.cosineSimilarity(
        embedding,
        vector.embedding
      )

      results.push({
        item: vector,
        similarity,
      })
    }

    // Sort by similarity (descending) and return top K
    results.sort((a, b) => b.similarity - a.similarity)

    return results.slice(0, topK)
  }

  /**
   * Clear all vectors
   */
  clear(): void {
    this.vectors.clear()
  }

  /**
   * Get count of stored vectors
   */
  count(): number {
    return this.vectors.size
  }

  /**
   * Generate embedding for text using vectorizer
   */
  private generateEmbedding(text: string): number[] {
    // Use the same vectorizer to ensure consistent embeddings
    return this.vectorizer['textToVector'](text)
  }
}

/**
 * Global vector store instance (singleton pattern)
 */
let globalVectorStore: InMemoryVectorStore | null = null

/**
 * Get or create global vector store instance
 */
export function getVectorStore(): InMemoryVectorStore {
  if (!globalVectorStore) {
    globalVectorStore = new InMemoryVectorStore()
  }
  return globalVectorStore
}

/**
 * Create a new vector store instance (for isolated usage)
 */
export function createVectorStore(): InMemoryVectorStore {
  return new InMemoryVectorStore()
}

/**
 * Reset global vector store
 */
export function resetVectorStore(): void {
  globalVectorStore = null
}
