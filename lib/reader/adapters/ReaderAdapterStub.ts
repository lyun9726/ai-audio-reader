import type { ParseResult, ReaderBlock } from '../../types'

export class ReaderAdapterStub {
  static parse(source: string): ParseResult {
    const demoBlocks: ReaderBlock[] = [
      {
        type: 'paragraph',
        text: 'This is a demo article paragraph 1. Bitcoin is a decentralized digital currency.',
      },
      {
        type: 'paragraph',
        text: 'It operates without a central bank or single administrator.',
      },
      {
        type: 'paragraph',
        text: 'The network is peer-to-peer and transactions take place between users directly.',
      },
      {
        type: 'paragraph',
        text: 'These transactions are verified by network nodes through cryptography.',
      },
      {
        type: 'paragraph',
        text: 'Bitcoin was invented in 2008 by an unknown person or group using the name Satoshi Nakamoto.',
      },
    ]

    return {
      blocks: demoBlocks,
      metadata: {
        title: 'Demo Article: Understanding Bitcoin',
        byline: 'Demo Author',
        sourceUrl: source,
      },
    }
  }
}
