# Reader Pipeline v2

A modular, extensible pipeline architecture for processing content from various sources into enriched `ReaderBlock[]` with optional vector embeddings.

## Overview

The Reader Pipeline v2 provides a flexible plugin-based system for:
- **Extracting** content from URLs, files, PDFs, EPUBs, and images
- **Cleaning** and normalizing text blocks
- **Enriching** blocks with metadata and statistics
- **Vectorizing** content for semantic search capabilities

## Architecture

The pipeline executes in four sequential phases:

```
Source → Extraction → Cleaning → Enrichment → Vectorization → Result
```

Each phase can have multiple plugins that run in sequence. Plugins are registered with the `PipelineEngine` and executed automatically.

## Core Components

### PipelineEngine

The main orchestrator that manages plugin registration and execution.

```typescript
import { PipelineEngine } from '@/lib/pipeline/engine'
import { registerDefaultPlugins } from '@/lib/pipeline/plugins'

const engine = new PipelineEngine()
registerDefaultPlugins(engine)

const result = await engine.run(
  { type: 'url', url: 'https://example.com' },
  { enableVectorization: true }
)
```

### Plugin Types

#### 1. Extractor
Converts source input into `ReaderBlock[]`.

```typescript
interface Extractor extends Plugin<PipelineSource, ExtractResult> {
  canHandle(source: PipelineSource): boolean
}
```

#### 2. Cleaner
Cleans and normalizes blocks (merge short blocks, split long ones, etc.).

```typescript
interface Cleaner extends Plugin<ReaderBlock[], CleanResult> {}
```

#### 3. Enricher
Adds metadata like word count, language detection, reading time.

```typescript
interface Enricher extends Plugin<ReaderBlock[], EnrichResult> {}
```

#### 4. Vectorizer
Generates embeddings for semantic search.

```typescript
interface Vectorizer extends Plugin<ReaderBlock[], VectorizeResult> {}
```

## Usage Examples

### Basic Usage

```typescript
import { createConfiguredEngine } from '@/lib/pipeline/plugins'

const engine = createConfiguredEngine()

const result = await engine.run({
  type: 'url',
  url: 'https://example.com/article'
})

console.log(`Processed ${result.blocks.length} blocks`)
```

### With Vectorization

```typescript
const result = await engine.run(
  { type: 'url', url: 'https://example.com' },
  { enableVectorization: true }
)

// Save vectors to store
import { getVectorStore } from '@/lib/storage/vectorStoreStub'
const vectorStore = getVectorStore()
vectorStore.save(result.vectors)

// Query similar content
const similar = vectorStore.queryByText('machine learning', 5)
```

### Custom Options

```typescript
const result = await engine.run(
  { type: 'pdf', url: 'https://example.com/paper.pdf' },
  {
    enableVectorization: true,
    enableCleaning: true,
    enableEnrichment: true,
    metadata: { category: 'research' }
  }
)
```

## Creating Custom Plugins

### Custom Extractor

```typescript
import type { Extractor, PipelineSource, ExtractResult } from '@/lib/pipeline/types'

class CustomExtractor implements Extractor {
  name = 'custom-extractor'

  canHandle(source: PipelineSource): boolean {
    return source.type === 'custom'
  }

  async run(ctx: PipelineContext, source: PipelineSource): Promise<ExtractResult> {
    // Your extraction logic
    const blocks = await extractFromCustomSource(source.url)
    return { blocks, metadata: { source: 'custom' } }
  }
}

// Register
engine.registerExtractor('custom', new CustomExtractor())
```

### Custom Enricher

```typescript
import type { Enricher, EnrichResult } from '@/lib/pipeline/types'

class SentimentEnricher implements Enricher {
  name = 'sentiment-enricher'

  async run(ctx: PipelineContext, blocks: ReaderBlock[]): Promise<EnrichResult> {
    const enrichedBlocks = blocks.map(block => {
      if (block.type === 'text') {
        const sentiment = analyzeSentiment(block.text)
        return {
          ...block,
          metadata: {
            ...block.metadata,
            sentiment: sentiment.score,
            emotion: sentiment.dominant
          }
        }
      }
      return block
    })

    return { blocks: enrichedBlocks }
  }
}

// Register
engine.registerEnricher('sentiment', new SentimentEnricher())
```

### Custom Vectorizer

```typescript
import type { Vectorizer, VectorizeResult } from '@/lib/pipeline/types'

class OpenAIVectorizer implements Vectorizer {
  name = 'openai-vectorizer'

  async run(ctx: PipelineContext, blocks: ReaderBlock[]): Promise<VectorizeResult> {
    const vectors = []

    for (const block of blocks) {
      if (block.type === 'text') {
        const embedding = await getOpenAIEmbedding(block.text)
        vectors.push({
          id: block.id,
          text: block.text,
          embedding: embedding
        })
      }
    }

    return { vectors }
  }
}

// Register
engine.registerVectorizer('openai', new OpenAIVectorizer())
```

## Default Plugins

### DefaultExtractor
- Handles URLs, files, PDFs, EPUBs, and images
- Uses `ReaderEngine` for URL parsing
- Provides demo data for test file path

### CleanBlocksPlugin
- Wraps `cleanBlocks` utility
- Merges short blocks (<40 chars)
- Splits long blocks (>300 chars)
- Removes hyphenation

### MetadataEnricher
- Calculates word count, sentence count
- Estimates reading time
- Detects language (stub)
- Counts tokens

### SimpleVectorizer
- Generates deterministic embeddings
- Uses character-based hashing
- 16-dimensional vectors
- Cosine similarity search

## Vector Store

The in-memory vector store supports:

```typescript
import { getVectorStore } from '@/lib/storage/vectorStoreStub'

const store = getVectorStore()

// Save vectors
store.save(vectors)

// Query by text
const results = store.queryByText('search query', 5)

// Query by vector
const similar = store.queryByVector(embedding, 10)

// Get vector by ID
const vector = store.get('vector-id')
```

## Pipeline Result

```typescript
interface PipelineResult {
  blocks: ReaderBlock[]
  vectors?: VectorItem[]
  metadata?: {
    // Extractor metadata
    source: string
    extractedAt: number

    // Enricher metadata
    totalWords: number
    totalReadingTimeMinutes: number
    dominantLanguage: string

    // Execution stats
    stats: {
      duration: number
      blocksExtracted: number
      vectorsGenerated: number
    }
  }
}
```

## Configuration Options

### Engine Configuration

```typescript
const engine = new PipelineEngine()

// Register specific plugins
engine.registerExtractor('default', createDefaultExtractor())
engine.registerCleaner('clean', createCleanBlocksPlugin())
engine.registerEnricher('metadata', createMetadataEnricher())
engine.registerVectorizer('simple', createSimpleVectorizer())
```

### Execution Options

```typescript
interface PipelineOptions {
  enableVectorization?: boolean  // Default: false
  enableCleaning?: boolean        // Default: true
  enableEnrichment?: boolean      // Default: true
  metadata?: Record<string, any>  // Custom metadata
  env?: Record<string, any>       // Environment variables
}
```

## Swapping Plugins

Replace default plugins with custom implementations:

```typescript
// Remove default vectorizer, add custom one
const engine = createEngineWithoutVectorization()
engine.registerVectorizer('openai', new OpenAIVectorizer())
```

## Development

### Running Demo

```typescript
import { runDemo } from '@/lib/pipeline/runDemo'

await runDemo()
```

### Plugin Logging

The engine logs detailed execution info in development mode:

```
[PipelineEngine] === Pipeline Execution Started ===
[PipelineEngine] Source: url - https://example.com
[PipelineEngine] --- Phase 1: Extraction ---
[PipelineEngine] Running extractor: default-extractor
[PipelineEngine] Extracted 42 blocks
[PipelineEngine] --- Phase 2: Cleaning ---
[PipelineEngine] Running cleaner: clean-blocks
[PipelineEngine] Cleaned to 38 blocks
...
```

## Extension Points

The pipeline is designed for extensibility:

1. **Add new source types**: Implement `Extractor` for new formats
2. **Custom cleaning logic**: Create specialized `Cleaner` plugins
3. **Advanced enrichment**: Build `Enricher` plugins for AI analysis
4. **Production vectorizers**: Swap `SimpleVectorizer` with OpenAI/Cohere
5. **Storage backends**: Replace in-memory stores with persistent DBs

## Best Practices

1. **Plugin isolation**: Each plugin should be self-contained
2. **Error handling**: Plugins should throw descriptive errors
3. **Metadata consistency**: Use standard metadata keys
4. **Performance**: Cache expensive operations
5. **Testing**: Test plugins independently before integration

## See Also

- [TASK6_README.md](../../docs/TASK6_README.md) - Detailed architecture documentation
- [types.ts](./types.ts) - Core type definitions
- [engine.ts](./engine.ts) - Pipeline engine implementation
