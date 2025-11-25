/**
 * Simple Vectorizer Plugin
 * Generates deterministic local vector embeddings (mock implementation)
 */

import type { PipelineContext, VectorizeResult, Vectorizer, VectorItem } from '../types'
import type { ReaderBlock } from '@/lib/types'

/**
 * Vector dimensions
 */
const VECTOR_DIMENSIONS = 16

/**
 * Simple vectorizer plugin implementation
 * Uses deterministic character-based hashing for embeddings
 */
export class SimpleVectorizer implements Vectorizer {
  name = 'simple-vectorizer'
  private dimensions: number

  constructor(dimensions: number = VECTOR_DIMENSIONS) {
    this.dimensions = dimensions
  }

  /**
   * Initialize vectorizer (optional)
   */
  async init(ctx: PipelineContext): Promise<void> {
    // No initialization needed
  }

  /**
   * Generate vectors from blocks
   */
  async run(ctx: PipelineContext, blocks: ReaderBlock[]): Promise<VectorizeResult> {
    const vectors: VectorItem[] = []

    for (const block of blocks) {
      if (block.type === 'paragraph' && block.text) {
        const vector = this.textToVector(block.text)
        vectors.push({
          id: block.id || `vector-${vectors.length}`,
          text: block.text,
          embedding: vector,
          metadata: {
            blockType: block.type,
            blockIndex: block.meta?.blockIndex,
            wordCount: block.meta?.wordCount,
          },
        })
      }
    }

    return {
      vectors,
      metadata: {
        vectorizer: this.name,
        vectorizedAt: Date.now(),
        vectorCount: vectors.length,
        dimensions: this.dimensions,
        algorithm: 'char-code-hash',
      },
    }
  }

  /**
   * Convert text to vector embedding (deterministic mock)
   * Uses character code statistics to generate a fixed-length vector
   */
  private textToVector(text: string): number[] {
    const vector = new Array(this.dimensions).fill(0)

    if (!text || text.length === 0) {
      return vector
    }

    // Normalize text
    const normalized = text.toLowerCase().trim()

    // Calculate character frequencies
    const charCodes: number[] = []
    for (let i = 0; i < normalized.length; i++) {
      charCodes.push(normalized.charCodeAt(i))
    }

    // Generate vector components using different hash functions
    for (let dim = 0; dim < this.dimensions; dim++) {
      let value = 0

      // Different hash strategy for each dimension
      switch (dim % 4) {
        case 0: // Sum of char codes with offset
          value = charCodes.reduce((sum, code, idx) => {
            return sum + (code * (idx + dim + 1))
          }, 0)
          break

        case 1: // XOR-based hash
          value = charCodes.reduce((xor, code, idx) => {
            return xor ^ (code << (idx % 8))
          }, dim)
          break

        case 2: // Average of char codes in chunks
          const chunkSize = Math.max(1, Math.floor(charCodes.length / (dim + 1)))
          const chunk = charCodes.slice(dim * chunkSize, (dim + 1) * chunkSize)
          value = chunk.reduce((sum, code) => sum + code, 0) / Math.max(1, chunk.length)
          break

        case 3: // Product-based hash
          value = charCodes.reduce((prod, code, idx) => {
            return (prod * code) % 10000
          }, dim + 1)
          break
      }

      // Normalize to [-1, 1] range
      vector[dim] = this.normalize(value, -1, 1)
    }

    // L2 normalization
    return this.l2Normalize(vector)
  }

  /**
   * Normalize value to range [min, max]
   */
  private normalize(value: number, min: number, max: number): number {
    // Use sine function to map to [-1, 1]
    const normalized = Math.sin(value / 1000)
    // Scale to [min, max]
    return min + ((normalized + 1) / 2) * (max - min)
  }

  /**
   * L2 normalization (unit vector)
   */
  private l2Normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    )

    if (magnitude === 0) {
      return vector
    }

    return vector.map(val => val / magnitude)
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions')
    }

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0
    }

    return dotProduct / (magnitudeA * magnitudeB)
  }
}

/**
 * Create and export simple vectorizer instance
 */
export function createSimpleVectorizer(dimensions?: number): SimpleVectorizer {
  return new SimpleVectorizer(dimensions)
}
