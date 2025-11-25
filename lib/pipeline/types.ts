/**
 * Pipeline Types
 * Core type definitions for the Reader Pipeline v2 architecture
 */

import type { ReaderBlock } from '@/lib/types'

/**
 * Source types supported by the pipeline
 */
export type SourceType = 'url' | 'file' | 'image' | 'pdf' | 'epub'

/**
 * Pipeline source definition
 */
export interface PipelineSource {
  type: SourceType
  url: string
}

/**
 * Pipeline execution context
 */
export interface PipelineContext {
  source: PipelineSource
  metadata?: Record<string, any>
  env?: Record<string, any>
}

/**
 * Result from extraction phase
 */
export interface ExtractResult {
  blocks: ReaderBlock[]
  metadata?: Record<string, any>
}

/**
 * Result from cleaning phase
 */
export interface CleanResult {
  blocks: ReaderBlock[]
  metadata?: Record<string, any>
}

/**
 * Result from enrichment phase
 */
export interface EnrichResult {
  blocks: ReaderBlock[]
  metadata?: Record<string, any>
}

/**
 * Vector item for embeddings
 */
export interface VectorItem {
  id: string
  text: string
  embedding?: number[]
  metadata?: Record<string, any>
}

/**
 * Result from vectorization phase
 */
export interface VectorizeResult {
  vectors: VectorItem[]
  metadata?: Record<string, any>
}

/**
 * Complete pipeline result
 */
export interface PipelineResult {
  blocks: ReaderBlock[]
  vectors?: VectorItem[]
  metadata?: Record<string, any>
}

/**
 * Base plugin interface
 */
export interface Plugin<TInput = any, TOutput = any> {
  name: string
  init?(ctx: PipelineContext): Promise<void>
  run(ctx: PipelineContext, data: TInput): Promise<TOutput>
}

/**
 * Extractor plugin - converts source to blocks
 */
export interface Extractor extends Plugin<PipelineSource, ExtractResult> {
  canHandle(source: PipelineSource): boolean
}

/**
 * Cleaner plugin - cleans and normalizes blocks
 */
export interface Cleaner extends Plugin<ReaderBlock[], CleanResult> {}

/**
 * Enricher plugin - adds metadata and enrichment to blocks
 */
export interface Enricher extends Plugin<ReaderBlock[], EnrichResult> {}

/**
 * Vectorizer plugin - generates embeddings from blocks
 */
export interface Vectorizer extends Plugin<ReaderBlock[], VectorizeResult> {}

/**
 * Pipeline execution options
 */
export interface PipelineOptions {
  enableVectorization?: boolean
  enableCleaning?: boolean
  enableEnrichment?: boolean
  metadata?: Record<string, any>
  env?: Record<string, any>
}

/**
 * Pipeline execution statistics
 */
export interface PipelineStats {
  startTime: number
  endTime: number
  duration: number
  blocksExtracted: number
  blocksCleaned: number
  blocksEnriched: number
  vectorsGenerated: number
  errors: string[]
}
