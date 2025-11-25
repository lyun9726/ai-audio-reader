import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import type { ParseResult, ReaderBlock } from '../types'
import { ReaderAdapterStub } from './adapters/ReaderAdapterStub'
import { cleanBlocks, getAutoFormatSetting } from './cleanBlocks'

export class ReaderEngine {
  /**
   * Parse any public webpage using Mozilla Readability
   */
  static async parseFromUrl(url: string): Promise<ParseResult> {
    // Demo path handling
    if (url.includes('/mnt/data/') || url.includes('5321c35c-86d2-43e9-b68d-8963068f3405')) {
      const result = ReaderAdapterStub.parse(url)

      // Apply auto-formatting if enabled
      if (getAutoFormatSetting()) {
        result.blocks = cleanBlocks(result.blocks)
      }

      return result
    }

    try {
      // 1) Fetch raw HTML
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIAudioReader/1.0)'
        },
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        return {
          blocks: [],
          metadata: {
            error: `HTTP ${response.status}: Failed to fetch`
          }
        }
      }

      const html = await response.text()

      // 2) Load into JSDOM
      const dom = new JSDOM(html, { url })

      // 3) Run Readability
      const reader = new Readability(dom.window.document)
      const article = reader.parse()

      if (!article) {
        return {
          blocks: [],
          metadata: { error: 'Readability failed to parse content' }
        }
      }

      // 4) Convert extracted HTML into paragraph blocks
      let blocks: ReaderBlock[] = ReaderEngine.convertToBlocks(article.content)

      // 5) Apply auto-formatting if enabled
      if (getAutoFormatSetting()) {
        blocks = cleanBlocks(blocks)
      }

      return {
        blocks,
        metadata: {
          title: article.title || '',
          byline: article.byline || '',
          length: article.length || 0,
          excerpt: article.excerpt || '',
          siteName: dom.window.document.title || '',
          sourceUrl: url
        }
      }
    } catch (error: any) {
      return {
        blocks: [],
        metadata: {
          error: error?.message || 'Unknown parsing error'
        }
      }
    }
  }

  /**
   * Convert HTML from Readability into ReaderBlock[]
   */
  private static convertToBlocks(contentHtml: string): ReaderBlock[] {
    const dom = new JSDOM(contentHtml)
    const doc = dom.window.document

    const blocks: ReaderBlock[] = []
    const nodes = Array.from(doc.body.childNodes)

    for (const node of nodes) {
      if (node.nodeType === 3) {
        // text node
        const text = node.textContent?.trim()
        if (text) {
          blocks.push({
            type: 'paragraph',
            text,
          })
        }
      }

      if (node.nodeType === 1) {
        const el = node as HTMLElement

        if (el.tagName === 'P' || el.tagName === 'DIV') {
          const text = el.textContent?.trim()
          if (text) {
            blocks.push({
              type: 'paragraph',
              text,
            })
          }
        }

        if (el.tagName === 'IMG') {
          const src = el.getAttribute('src')
          if (src) {
            blocks.push({
              type: 'image',
              url: src,
            })
          }
        }
      }
    }

    return blocks
  }
}
