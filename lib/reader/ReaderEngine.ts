import type { ParseResult, ReaderBlock } from '../types'
import { ReaderAdapterStub } from './adapters/ReaderAdapterStub'

export class ReaderEngine {
  static async parseFromUrl(url: string): Promise<ParseResult> {
    // Demo path handling
    if (url.includes('/mnt/data/') || url.includes('5321c35c-86d2-43e9-b68d-8963068f3405')) {
      return ReaderAdapterStub.parse(url)
    }

    // Real URL parsing with Readability
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIAudioReader/1.0)',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        return {
          blocks: [],
          metadata: {
            error: `HTTP ${response.status}: ${response.statusText}`,
          },
        }
      }

      const html = await response.text()
      return this.parseHTML(html, url)
    } catch (error: any) {
      return {
        blocks: [],
        metadata: {
          error: error.message || 'Failed to fetch URL',
        },
      }
    }
  }

  static parseHTML(html: string, sourceUrl?: string): ParseResult {
    // Remove scripts and styles
    let cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

    // Extract title
    const titleMatch = cleanHtml.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled'

    // Extract paragraphs
    const paragraphMatches = cleanHtml.match(/<p[^>]*>([^<]+(?:<[^p][^>]*>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi) || []

    const blocks: ReaderBlock[] = paragraphMatches
      .map((p, index) => {
        const text = p.replace(/<[^>]+>/g, '').trim()
        if (text.length < 20) return null

        return {
          id: `block-${index + 1}`,
          order: index + 1,
          text,
        }
      })
      .filter(Boolean) as ReaderBlock[]

    if (blocks.length === 0) {
      blocks.push({
        id: 'block-1',
        order: 1,
        text: 'No readable content found.',
      })
    }

    return {
      blocks,
      metadata: {
        title,
      },
    }
  }
}
