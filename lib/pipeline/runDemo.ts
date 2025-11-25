/**
 * Pipeline Demo Runner
 * Demonstrates pipeline execution with demo file
 */

import { PipelineEngine } from './engine'
import { registerDefaultPlugins } from './plugins'
import type { PipelineSource } from './types'
import { saveBook } from '@/lib/storage/inMemoryDB'
import { getVectorStore } from '@/lib/storage/vectorStoreStub'

/**
 * Demo file path
 */
const DEMO_FILE_PATH = '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png'

/**
 * Demo book ID
 */
const DEMO_BOOK_ID = 'pipeline-demo-1'

/**
 * Run pipeline demo with demo file
 */
export async function runDemo(): Promise<void> {
  console.log('\n========================================')
  console.log('Pipeline Demo Started')
  console.log('========================================\n')

  try {
    // Create demo source
    const demoSource: PipelineSource = {
      type: 'file',
      url: DEMO_FILE_PATH,
    }

    console.log('Demo Source:', demoSource)

    // Create and configure pipeline engine
    const engine = new PipelineEngine()
    registerDefaultPlugins(engine)

    console.log('\nRegistered Plugins:')
    const plugins = engine.getPluginNames()
    console.log('  Extractors:', plugins.extractors.join(', '))
    console.log('  Cleaners:', plugins.cleaners.join(', '))
    console.log('  Enrichers:', plugins.enrichers.join(', '))
    console.log('  Vectorizers:', plugins.vectorizers.join(', '))

    // Run pipeline with vectorization enabled
    const result = await engine.run(demoSource, {
      enableVectorization: true,
      enableCleaning: true,
      enableEnrichment: true,
    })

    console.log('\n========================================')
    console.log('Pipeline Result')
    console.log('========================================\n')

    console.log('Blocks:', result.blocks.length)
    console.log('Vectors:', result.vectors?.length || 0)

    // Display block details
    console.log('\nBlock Details:')
    result.blocks.forEach((block, index) => {
      console.log(`\n--- Block ${index + 1} ---`)
      console.log('  Type:', block.type)
      if (block.type === 'paragraph') {
        console.log('  Text:', block.text?.substring(0, 100) + '...')
        if (block.meta) {
          console.log('  Word Count:', block.meta.wordCount)
          console.log('  Sentence Count:', block.meta.sentenceCount)
          console.log('  Language:', block.meta.detectedLang)
          console.log('  Reading Time:', block.meta.readingTimeSeconds + 's')
        }
      } else if (block.type === 'image') {
        console.log('  Image URL:', block.url)
      }
    })

    // Display metadata
    console.log('\n========================================')
    console.log('Pipeline Metadata')
    console.log('========================================\n')

    if (result.metadata) {
      console.log('Total Words:', result.metadata.totalWords)
      console.log('Total Reading Time:', result.metadata.totalReadingTimeMinutes + ' minutes')
      console.log('Dominant Language:', result.metadata.dominantLanguage)
      console.log('Text Blocks:', result.metadata.textBlockCount)
      console.log('Image Blocks:', result.metadata.imageBlockCount)

      if (result.metadata.stats) {
        console.log('\nExecution Stats:')
        console.log('  Duration:', result.metadata.stats.duration + 'ms')
        console.log('  Blocks Extracted:', result.metadata.stats.blocksExtracted)
        console.log('  Blocks Cleaned:', result.metadata.stats.blocksCleaned)
        console.log('  Vectors Generated:', result.metadata.stats.vectorsGenerated)
      }
    }

    // Save to in-memory DB
    console.log('\n========================================')
    console.log('Saving to Storage')
    console.log('========================================\n')

    saveBook({
      id: DEMO_BOOK_ID,
      title: 'Pipeline Demo Book',
      sourceUrl: DEMO_FILE_PATH,
      blocks: result.blocks,
    })

    console.log('Saved to inMemoryDB with bookId:', DEMO_BOOK_ID)

    // Save vectors to vector store
    if (result.vectors && result.vectors.length > 0) {
      const vectorStore = getVectorStore()
      vectorStore.save(result.vectors)
      console.log('Saved', result.vectors.length, 'vectors to vector store')

      // Demo similarity search
      console.log('\n========================================')
      console.log('Vector Similarity Search Demo')
      console.log('========================================\n')

      const queryText = 'pipeline architecture'
      console.log('Query:', queryText)

      const searchResults = vectorStore.queryByText(queryText, 3)
      console.log('\nTop 3 Similar Blocks:')

      searchResults.forEach((result, index) => {
        console.log(`\n${index + 1}. Similarity: ${result.similarity.toFixed(4)}`)
        console.log('   Text:', result.item.text.substring(0, 100) + '...')
      })
    }

    console.log('\n========================================')
    console.log('Pipeline Demo Completed Successfully')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n========================================')
    console.error('Pipeline Demo Failed')
    console.error('========================================\n')
    console.error('Error:', error instanceof Error ? error.message : String(error))
    console.error('\nStack:', error instanceof Error ? error.stack : '')
    throw error
  }
}

/**
 * Run demo if executed directly
 */
if (require.main === module) {
  runDemo().catch(console.error)
}
