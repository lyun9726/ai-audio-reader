/**
 * Clean Blocks Plugin
 * Wraps existing cleanBlocks utility for pipeline integration
 */

import type { PipelineContext, CleanResult, Cleaner } from '../types'
import type { ReaderBlock } from '@/lib/types'
import { cleanBlocks } from '@/lib/reader/cleanBlocks'

/**
 * Clean blocks plugin implementation
 */
export class CleanBlocksPlugin implements Cleaner {
  name = 'clean-blocks'

  /**
   * Initialize cleaner (optional)
   */
  async init(ctx: PipelineContext): Promise<void> {
    // No initialization needed
  }

  /**
   * Clean and normalize blocks
   */
  async run(ctx: PipelineContext, blocks: ReaderBlock[]): Promise<CleanResult> {
    const startCount = blocks.length

    // Use existing cleanBlocks utility
    const cleanedBlocks = cleanBlocks(blocks)

    const endCount = cleanedBlocks.length

    return {
      blocks: cleanedBlocks,
      metadata: {
        cleaner: this.name,
        cleanedAt: Date.now(),
        originalBlockCount: startCount,
        cleanedBlockCount: endCount,
        blocksRemoved: startCount - endCount,
        operations: {
          merged: this.countMergedBlocks(startCount, endCount),
          split: this.countSplitBlocks(startCount, endCount),
          normalized: endCount,
        },
      },
    }
  }

  /**
   * Estimate number of blocks merged
   */
  private countMergedBlocks(before: number, after: number): number {
    return before > after ? before - after : 0
  }

  /**
   * Estimate number of blocks split
   */
  private countSplitBlocks(before: number, after: number): number {
    return after > before ? after - before : 0
  }
}

/**
 * Create and export clean blocks plugin instance
 */
export function createCleanBlocksPlugin(): CleanBlocksPlugin {
  return new CleanBlocksPlugin()
}
