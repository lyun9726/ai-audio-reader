/**
 * Pipeline Tests
 * Unit tests for the Reader Pipeline v2
 */

import { PipelineEngine } from '@/lib/pipeline/engine'
import {
  createConfiguredEngine,
  createMinimalEngine,
  createEngineWithoutVectorization,
  registerDefaultPlugins,
} from '@/lib/pipeline/plugins'
import type { PipelineSource } from '@/lib/pipeline/types'
import { getVectorStore, resetVectorStore } from '@/lib/storage/vectorStoreStub'

describe('PipelineEngine', () => {
  test('should create engine instance', () => {
    const engine = new PipelineEngine()
    expect(engine).toBeDefined()
    expect(engine).toBeInstanceOf(PipelineEngine)
  })

  test('should register plugins', () => {
    const engine = new PipelineEngine()
    registerDefaultPlugins(engine)

    const counts = engine.getPluginCounts()
    expect(counts.extractors).toBeGreaterThan(0)
    expect(counts.cleaners).toBeGreaterThan(0)
    expect(counts.enrichers).toBeGreaterThan(0)
    expect(counts.vectorizers).toBeGreaterThan(0)
  })

  test('should get plugin names', () => {
    const engine = createConfiguredEngine()
    const names = engine.getPluginNames()

    expect(names.extractors).toContain('default-extractor')
    expect(names.cleaners).toContain('clean-blocks')
    expect(names.enrichers).toContain('metadata-enricher')
    expect(names.vectorizers).toContain('simple-vectorizer')
  })

  test('should process demo file source', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableVectorization: true,
      enableCleaning: true,
      enableEnrichment: true,
    })

    expect(result).toBeDefined()
    expect(result.blocks).toBeDefined()
    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.vectors).toBeDefined()
    expect(result.vectors!.length).toBeGreaterThan(0)
    expect(result.metadata).toBeDefined()
  })

  test('should process without vectorization', async () => {
    const engine = createEngineWithoutVectorization()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableVectorization: false,
    })

    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.vectors).toBeUndefined()
  })

  test('should extract blocks with correct types', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source)

    const textBlocks = result.blocks.filter(b => b.type === 'paragraph')
    const imageBlocks = result.blocks.filter(b => b.type === 'image')

    expect(textBlocks.length).toBeGreaterThan(0)
    expect(imageBlocks.length).toBeGreaterThan(0)
  })

  test('should add metadata to blocks', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableEnrichment: true,
    })

    const textBlock = result.blocks.find(b => b.type === 'paragraph')
    expect(textBlock).toBeDefined()
    expect(textBlock!.meta).toBeDefined()
    expect(textBlock!.meta!.wordCount).toBeGreaterThan(0)
    expect(textBlock!.meta!.detectedLang).toBeDefined()
    expect(textBlock!.meta!.readingTimeSeconds).toBeGreaterThan(0)
  })

  test('should include overall statistics', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableEnrichment: true,
    })

    expect(result.metadata).toBeDefined()
    expect(result.metadata!.totalWords).toBeGreaterThan(0)
    expect(result.metadata!.totalReadingTimeMinutes).toBeGreaterThan(0)
    expect(result.metadata!.dominantLanguage).toBeDefined()
    expect(result.metadata!.textBlockCount).toBeGreaterThan(0)
  })
})

describe('VectorStore', () => {
  beforeEach(() => {
    resetVectorStore()
  })

  test('should save and retrieve vectors', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableVectorization: true,
    })

    const store = getVectorStore()
    store.save(result.vectors!)

    expect(store.count()).toBe(result.vectors!.length)

    const firstVector = result.vectors![0]
    const retrieved = store.get(firstVector.id)
    expect(retrieved).toBeDefined()
    expect(retrieved!.id).toBe(firstVector.id)
    expect(retrieved!.text).toBe(firstVector.text)
  })

  test('should query by text', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableVectorization: true,
    })

    const store = getVectorStore()
    store.save(result.vectors!)

    const searchResults = store.queryByText('pipeline', 3)
    expect(searchResults).toBeDefined()
    expect(searchResults.length).toBeGreaterThan(0)
    expect(searchResults.length).toBeLessThanOrEqual(3)
    expect(searchResults[0].similarity).toBeDefined()
    expect(searchResults[0].item).toBeDefined()
  })

  test('should return results sorted by similarity', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableVectorization: true,
    })

    const store = getVectorStore()
    store.save(result.vectors!)

    const searchResults = store.queryByText('pipeline architecture', 5)

    // Check that results are sorted in descending order by similarity
    for (let i = 0; i < searchResults.length - 1; i++) {
      expect(searchResults[i].similarity).toBeGreaterThanOrEqual(
        searchResults[i + 1].similarity
      )
    }
  })

  test('should clear all vectors', () => {
    const store = getVectorStore()

    store.saveOne({
      id: 'test-1',
      text: 'Test text',
      embedding: [0.1, 0.2, 0.3],
    })

    expect(store.count()).toBe(1)

    store.clear()

    expect(store.count()).toBe(0)
  })
})

describe('Plugin System', () => {
  test('should create configured engine', () => {
    const engine = createConfiguredEngine()
    const counts = engine.getPluginCounts()

    expect(counts.extractors).toBe(1)
    expect(counts.cleaners).toBe(1)
    expect(counts.enrichers).toBe(1)
    expect(counts.vectorizers).toBe(1)
  })

  test('should create minimal engine', () => {
    const engine = createMinimalEngine()
    const counts = engine.getPluginCounts()

    expect(counts.extractors).toBe(1)
    expect(counts.cleaners).toBe(0)
    expect(counts.enrichers).toBe(0)
    expect(counts.vectorizers).toBe(0)
  })

  test('should create engine without vectorization', () => {
    const engine = createEngineWithoutVectorization()
    const counts = engine.getPluginCounts()

    expect(counts.extractors).toBe(1)
    expect(counts.cleaners).toBe(1)
    expect(counts.enrichers).toBe(1)
    expect(counts.vectorizers).toBe(0)
  })
})

describe('Pipeline Execution', () => {
  test('should handle errors gracefully', async () => {
    const engine = createMinimalEngine() // No cleaner/enricher plugins

    const invalidSource: PipelineSource = {
      type: 'url' as any,
      url: '', // Invalid empty URL
    }

    await expect(engine.run(invalidSource)).rejects.toThrow()
  })

  test('should include execution stats', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    const result = await engine.run(source, {
      enableVectorization: true,
    })

    expect(result.metadata!.stats).toBeDefined()
    expect(result.metadata!.stats.duration).toBeGreaterThan(0)
    expect(result.metadata!.stats.blocksExtracted).toBeGreaterThan(0)
    expect(result.metadata!.stats.startTime).toBeDefined()
    expect(result.metadata!.stats.endTime).toBeDefined()
  })

  test('should respect enableCleaning option', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    // With cleaning
    const resultWithCleaning = await engine.run(source, {
      enableCleaning: true,
    })

    // Without cleaning
    const resultWithoutCleaning = await engine.run(source, {
      enableCleaning: false,
    })

    // Both should have blocks, but counts may differ due to cleaning
    expect(resultWithCleaning.blocks.length).toBeGreaterThan(0)
    expect(resultWithoutCleaning.blocks.length).toBeGreaterThan(0)
  })

  test('should respect enableEnrichment option', async () => {
    const engine = createConfiguredEngine()

    const source: PipelineSource = {
      type: 'file',
      url: '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png',
    }

    // With enrichment
    const resultWithEnrichment = await engine.run(source, {
      enableEnrichment: true,
    })

    // Without enrichment
    const resultWithoutEnrichment = await engine.run(source, {
      enableEnrichment: false,
    })

    const enrichedBlock = resultWithEnrichment.blocks.find(b => b.type === 'paragraph')
    const unenrichedBlock = resultWithoutEnrichment.blocks.find(b => b.type === 'paragraph')

    expect(enrichedBlock!.meta?.wordCount).toBeDefined()
    expect(unenrichedBlock!.meta?.wordCount).toBeUndefined()
  })
})
