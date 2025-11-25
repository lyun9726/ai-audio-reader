/**
 * Pipeline Engine
 * Core orchestration engine for the modular reader pipeline
 */

import type {
  PipelineSource,
  PipelineContext,
  PipelineResult,
  PipelineOptions,
  PipelineStats,
  Extractor,
  Cleaner,
  Enricher,
  Vectorizer,
} from './types'

/**
 * Main pipeline execution engine
 */
export class PipelineEngine {
  private extractors: Map<string, Extractor> = new Map()
  private cleaners: Map<string, Cleaner> = new Map()
  private enrichers: Map<string, Enricher> = new Map()
  private vectorizers: Map<string, Vectorizer> = new Map()
  private isDev: boolean = process.env.NODE_ENV === 'development'

  /**
   * Register an extractor plugin
   */
  registerExtractor(name: string, extractor: Extractor): void {
    this.log(`Registering extractor: ${name}`)
    this.extractors.set(name, extractor)
  }

  /**
   * Register a cleaner plugin
   */
  registerCleaner(name: string, cleaner: Cleaner): void {
    this.log(`Registering cleaner: ${name}`)
    this.cleaners.set(name, cleaner)
  }

  /**
   * Register an enricher plugin
   */
  registerEnricher(name: string, enricher: Enricher): void {
    this.log(`Registering enricher: ${name}`)
    this.enrichers.set(name, enricher)
  }

  /**
   * Register a vectorizer plugin
   */
  registerVectorizer(name: string, vectorizer: Vectorizer): void {
    this.log(`Registering vectorizer: ${name}`)
    this.vectorizers.set(name, vectorizer)
  }

  /**
   * Run the complete pipeline on a source
   */
  async run(
    source: PipelineSource,
    options?: PipelineOptions
  ): Promise<PipelineResult> {
    const startTime = Date.now()
    const stats: PipelineStats = {
      startTime,
      endTime: 0,
      duration: 0,
      blocksExtracted: 0,
      blocksCleaned: 0,
      blocksEnriched: 0,
      vectorsGenerated: 0,
      errors: [],
    }

    this.log(`\n=== Pipeline Execution Started ===`)
    this.log(`Source: ${source.type} - ${source.url}`)

    // Create execution context
    const context: PipelineContext = {
      source,
      metadata: options?.metadata || {},
      env: options?.env || {},
    }

    try {
      // Phase 1: Extraction
      this.log(`\n--- Phase 1: Extraction ---`)
      const extractor = this.selectExtractor(source)
      if (!extractor) {
        throw new Error(`No extractor found for source type: ${source.type}`)
      }

      if (extractor.init) {
        this.log(`Initializing extractor: ${extractor.name}`)
        await extractor.init(context)
      }

      this.log(`Running extractor: ${extractor.name}`)
      const extractResult = await extractor.run(context, source)
      stats.blocksExtracted = extractResult.blocks.length
      this.log(`Extracted ${stats.blocksExtracted} blocks`)

      let blocks = extractResult.blocks
      let metadata = { ...extractResult.metadata }

      // Phase 2: Cleaning (optional)
      if (options?.enableCleaning !== false && this.cleaners.size > 0) {
        this.log(`\n--- Phase 2: Cleaning ---`)
        for (const [name, cleaner] of this.cleaners) {
          if (cleaner.init) {
            this.log(`Initializing cleaner: ${name}`)
            await cleaner.init(context)
          }

          this.log(`Running cleaner: ${name}`)
          const cleanResult = await cleaner.run(context, blocks)
          blocks = cleanResult.blocks
          stats.blocksCleaned = blocks.length
          metadata = { ...metadata, ...cleanResult.metadata }
          this.log(`Cleaned to ${stats.blocksCleaned} blocks`)
        }
      }

      // Phase 3: Enrichment (optional)
      if (options?.enableEnrichment !== false && this.enrichers.size > 0) {
        this.log(`\n--- Phase 3: Enrichment ---`)
        for (const [name, enricher] of this.enrichers) {
          if (enricher.init) {
            this.log(`Initializing enricher: ${name}`)
            await enricher.init(context)
          }

          this.log(`Running enricher: ${name}`)
          const enrichResult = await enricher.run(context, blocks)
          blocks = enrichResult.blocks
          stats.blocksEnriched = blocks.length
          metadata = { ...metadata, ...enrichResult.metadata }
          this.log(`Enriched ${stats.blocksEnriched} blocks`)
        }
      }

      // Phase 4: Vectorization (optional)
      let vectors = undefined
      if (options?.enableVectorization && this.vectorizers.size > 0) {
        this.log(`\n--- Phase 4: Vectorization ---`)
        for (const [name, vectorizer] of this.vectorizers) {
          if (vectorizer.init) {
            this.log(`Initializing vectorizer: ${name}`)
            await vectorizer.init(context)
          }

          this.log(`Running vectorizer: ${name}`)
          const vectorResult = await vectorizer.run(context, blocks)
          vectors = vectorResult.vectors
          stats.vectorsGenerated = vectors.length
          metadata = { ...metadata, ...vectorResult.metadata }
          this.log(`Generated ${stats.vectorsGenerated} vectors`)
        }
      }

      // Finalize stats
      stats.endTime = Date.now()
      stats.duration = stats.endTime - stats.startTime

      this.log(`\n=== Pipeline Execution Completed ===`)
      this.log(`Duration: ${stats.duration}ms`)
      this.log(`Blocks: ${blocks.length}`)
      if (vectors) {
        this.log(`Vectors: ${vectors.length}`)
      }

      return {
        blocks,
        vectors,
        metadata: {
          ...metadata,
          stats,
        },
      }
    } catch (error) {
      stats.errors.push(error instanceof Error ? error.message : String(error))
      stats.endTime = Date.now()
      stats.duration = stats.endTime - stats.startTime

      this.log(`\n=== Pipeline Execution Failed ===`)
      this.log(`Error: ${error instanceof Error ? error.message : String(error)}`)

      throw error
    }
  }

  /**
   * Select appropriate extractor for the source
   */
  private selectExtractor(source: PipelineSource): Extractor | null {
    for (const extractor of this.extractors.values()) {
      if (extractor.canHandle(source)) {
        return extractor
      }
    }
    return null
  }

  /**
   * Log message in dev mode
   */
  private log(message: string): void {
    if (this.isDev) {
      console.log(`[PipelineEngine] ${message}`)
    }
  }

  /**
   * Get registered plugin counts
   */
  getPluginCounts(): {
    extractors: number
    cleaners: number
    enrichers: number
    vectorizers: number
  } {
    return {
      extractors: this.extractors.size,
      cleaners: this.cleaners.size,
      enrichers: this.enrichers.size,
      vectorizers: this.vectorizers.size,
    }
  }

  /**
   * Get all registered plugin names
   */
  getPluginNames(): {
    extractors: string[]
    cleaners: string[]
    enrichers: string[]
    vectorizers: string[]
  } {
    return {
      extractors: Array.from(this.extractors.keys()),
      cleaners: Array.from(this.cleaners.keys()),
      enrichers: Array.from(this.enrichers.keys()),
      vectorizers: Array.from(this.vectorizers.keys()),
    }
  }
}
