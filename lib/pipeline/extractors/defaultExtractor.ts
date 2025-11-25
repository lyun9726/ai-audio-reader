/**
 * Default Extractor Plugin
 * Extracts content from various source types
 */

import type {
  PipelineSource,
  PipelineContext,
  ExtractResult,
  Extractor,
} from '../types'
import type { ReaderBlock } from '@/lib/types'
import { ReaderEngine } from '@/lib/reader/ReaderEngine'

/**
 * Demo file path for testing
 */
const DEMO_FILE_PATH = '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png'

/**
 * Default extractor implementation
 */
export class DefaultExtractor implements Extractor {
  name = 'default-extractor'

  /**
   * Check if this extractor can handle the source
   */
  canHandle(source: PipelineSource): boolean {
    // Can handle all source types
    return ['url', 'file', 'image', 'pdf', 'epub'].includes(source.type)
  }

  /**
   * Initialize extractor (optional)
   */
  async init(ctx: PipelineContext): Promise<void> {
    // No initialization needed
  }

  /**
   * Extract content from source
   */
  async run(ctx: PipelineContext, source: PipelineSource): Promise<ExtractResult> {
    // Check if this is the demo file
    if (source.url.includes(DEMO_FILE_PATH)) {
      return this.extractDemoFile(source)
    }

    // Handle different source types
    switch (source.type) {
      case 'url':
        return this.extractFromUrl(source)
      case 'file':
      case 'image':
        return this.extractFromFile(source)
      case 'pdf':
        return this.extractFromPdf(source)
      case 'epub':
        return this.extractFromEpub(source)
      default:
        throw new Error(`Unsupported source type: ${source.type}`)
    }
  }

  /**
   * Extract demo file (mock data)
   */
  private async extractDemoFile(source: PipelineSource): Promise<ExtractResult> {
    const blocks: ReaderBlock[] = [
      {
        id: 'demo-block-1',
        type: 'paragraph',
        text: 'Welcome to the AI Audio Reader Pipeline Demo',
      },
      {
        id: 'demo-block-2',
        type: 'paragraph',
        text: 'This is a demonstration of the new modular pipeline architecture. The pipeline supports extracting content from various sources including URLs, files, PDFs, EPUBs, and images.',
      },
      {
        id: 'demo-block-3',
        type: 'paragraph',
        text: 'The pipeline consists of multiple phases: extraction, cleaning, enrichment, and optional vectorization. Each phase can be customized with plugins to extend functionality.',
      },
      {
        id: 'demo-block-4',
        type: 'image',
        url: source.url,
        text: 'Demo image from pipeline',
      },
      {
        id: 'demo-block-5',
        type: 'paragraph',
        text: 'Key features of the pipeline include: pluggable architecture, vector embeddings support, metadata enrichment, content cleaning and normalization, and extensible plugin system.',
      },
      {
        id: 'demo-block-6',
        type: 'paragraph',
        text: 'You can easily add custom extractors for new source types, create custom cleaners for specialized content processing, build enrichers to add metadata and analysis, and implement vectorizers for semantic search capabilities.',
      },
      {
        id: 'demo-block-7',
        type: 'paragraph',
        text: 'The pipeline is designed to be fast, efficient, and easy to extend. It provides a solid foundation for building advanced reading experiences with AI-powered features.',
      },
    ]

    return {
      blocks,
      metadata: {
        source: 'demo-file',
        extractedAt: Date.now(),
        blockCount: blocks.length,
        sourceUrl: source.url,
      },
    }
  }

  /**
   * Extract from URL using ReaderEngine
   */
  private async extractFromUrl(source: PipelineSource): Promise<ExtractResult> {
    try {
      const result = await ReaderEngine.parseFromUrl(source.url)

      return {
        blocks: result.blocks,
        metadata: {
          source: 'url',
          extractedAt: Date.now(),
          blockCount: result.blocks.length,
          sourceUrl: source.url,
          title: result.metadata?.title,
          byline: result.metadata?.byline,
        },
      }
    } catch (error) {
      throw new Error(
        `Failed to extract from URL: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Extract from file (stub)
   */
  private async extractFromFile(source: PipelineSource): Promise<ExtractResult> {
    // For now, treat files as URLs and let ReaderEngine handle them
    // In production, you would implement file reading logic here
    return this.extractFromUrl(source)
  }

  /**
   * Extract from PDF (stub)
   */
  private async extractFromPdf(source: PipelineSource): Promise<ExtractResult> {
    // Stub implementation - in production, use pdf-parse or similar
    return this.extractFromUrl(source)
  }

  /**
   * Extract from EPUB (stub)
   */
  private async extractFromEpub(source: PipelineSource): Promise<ExtractResult> {
    // Stub implementation - in production, use epub parser
    return this.extractFromUrl(source)
  }
}

/**
 * Create and export default extractor instance
 */
export function createDefaultExtractor(): DefaultExtractor {
  return new DefaultExtractor()
}
