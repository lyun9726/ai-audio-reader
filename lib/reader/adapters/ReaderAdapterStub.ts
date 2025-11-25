import type { ParseResult, ReaderBlock } from '../../types'

export class ReaderAdapterStub {
  static parse(source: string): ParseResult {
    const demoBlocks: ReaderBlock[] = [
      {
        id: 'demo-1',
        order: 1,
        text: 'This is a demo article paragraph 1. Bitcoin is a decentralized digital currency.',
      },
      {
        id: 'demo-2',
        order: 2,
        text: 'It operates without a central bank or single administrator.',
      },
      {
        id: 'demo-3',
        order: 3,
        text: 'The network is peer-to-peer and transactions take place between users directly.',
      },
      {
        id: 'demo-4',
        order: 4,
        text: 'These transactions are verified by network nodes through cryptography.',
      },
      {
        id: 'demo-5',
        order: 5,
        text: 'Bitcoin was invented in 2008 by an unknown person or group using the name Satoshi Nakamoto.',
      },
    ]

    return {
      blocks: demoBlocks,
      metadata: {
        title: 'Demo Article: Understanding Bitcoin',
        author: 'Demo Author',
        language: 'en',
      },
    }
  }
}
