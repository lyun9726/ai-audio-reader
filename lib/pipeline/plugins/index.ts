/**
 * Pipeline Plugins Registry
 * Convenience functions to register default plugins
 */

import { PipelineEngine } from '../engine'
import { createDefaultExtractor } from '../extractors/defaultExtractor'
import { createCleanBlocksPlugin } from '../cleaners/cleanBlocksPlugin'
import { createMetadataEnricher } from '../enrichers/metadataEnricher'
import { createSimpleVectorizer } from '../vector/simpleVectorizer'

/**
 * Register all default plugins to the engine
 */
export function registerDefaultPlugins(engine: PipelineEngine): void {
  // Register extractor
  const extractor = createDefaultExtractor()
  engine.registerExtractor(extractor.name, extractor)

  // Register cleaner
  const cleaner = createCleanBlocksPlugin()
  engine.registerCleaner(cleaner.name, cleaner)

  // Register enricher
  const enricher = createMetadataEnricher()
  engine.registerEnricher(enricher.name, enricher)

  // Register vectorizer
  const vectorizer = createSimpleVectorizer()
  engine.registerVectorizer(vectorizer.name, vectorizer)
}

/**
 * Register only extractor plugin
 */
export function registerExtractor(engine: PipelineEngine): void {
  const extractor = createDefaultExtractor()
  engine.registerExtractor(extractor.name, extractor)
}

/**
 * Register only cleaner plugin
 */
export function registerCleaner(engine: PipelineEngine): void {
  const cleaner = createCleanBlocksPlugin()
  engine.registerCleaner(cleaner.name, cleaner)
}

/**
 * Register only enricher plugin
 */
export function registerEnricher(engine: PipelineEngine): void {
  const enricher = createMetadataEnricher()
  engine.registerEnricher(enricher.name, enricher)
}

/**
 * Register only vectorizer plugin
 */
export function registerVectorizer(engine: PipelineEngine): void {
  const vectorizer = createSimpleVectorizer()
  engine.registerVectorizer(vectorizer.name, vectorizer)
}

/**
 * Create a fully configured pipeline engine with all default plugins
 */
export function createConfiguredEngine(): PipelineEngine {
  const engine = new PipelineEngine()
  registerDefaultPlugins(engine)
  return engine
}

/**
 * Create a minimal pipeline engine with only extractor
 */
export function createMinimalEngine(): PipelineEngine {
  const engine = new PipelineEngine()
  registerExtractor(engine)
  return engine
}

/**
 * Create a pipeline engine without vectorization
 */
export function createEngineWithoutVectorization(): PipelineEngine {
  const engine = new PipelineEngine()
  registerExtractor(engine)
  registerCleaner(engine)
  registerEnricher(engine)
  return engine
}

// Re-export plugin creators for convenience
export {
  createDefaultExtractor,
  createCleanBlocksPlugin,
  createMetadataEnricher,
  createSimpleVectorizer,
}
