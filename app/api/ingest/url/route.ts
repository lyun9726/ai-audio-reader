import { NextRequest, NextResponse } from 'next/server'

interface IngestUrlRequest {
  url: string
  previewOnly?: boolean
  previewTranslated?: boolean
}

interface Block {
  id: string
  order: number
  text: string
}

export async function POST(req: NextRequest) {
  try {
    const body: IngestUrlRequest = await req.json()
    const { url, previewOnly = false, previewTranslated = false } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Handle local demo file
    if (url.includes('/mnt/data/') || url.includes('demo')) {
      return handleDemoFile(previewOnly, previewTranslated)
    }

    // Fetch URL content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIAudioReader/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Extract article content using basic readability logic
    const { title, blocks } = extractArticleContent(html)

    // Preview mode: return only first 3-5 blocks
    let resultBlocks = blocks
    if (previewOnly) {
      resultBlocks = blocks.slice(0, 5)
    }

    // If preview translation requested
    if (previewTranslated && previewOnly) {
      // Call translation API (will implement in next step)
      const translatedBlocks = await translateBlocks(resultBlocks)
      return NextResponse.json({
        title,
        blocks: translatedBlocks,
        isPreview: true,
      })
    }

    return NextResponse.json({
      title,
      blocks: resultBlocks,
      isPreview: previewOnly,
    })
  } catch (error: any) {
    console.error('[URL Ingest Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Demo file handler
function handleDemoFile(previewOnly: boolean, previewTranslated: boolean) {
  const demoBlocks: Block[] = [
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

  const blocks = previewOnly ? demoBlocks.slice(0, 3) : demoBlocks

  return NextResponse.json({
    title: 'Demo Article: Understanding Bitcoin',
    blocks,
    isPreview: previewOnly,
  })
}

// Basic content extraction (simplified readability)
function extractArticleContent(html: string): { title: string; blocks: Block[] } {
  // Remove scripts and styles
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Extract title
  const titleMatch = cleanHtml.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article'

  // Extract paragraphs
  const paragraphMatches = cleanHtml.match(/<p[^>]*>([^<]+(?:<[^p][^>]*>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi) || []

  const blocks: Block[] = paragraphMatches
    .map((p, index) => {
      // Strip HTML tags
      const text = p.replace(/<[^>]+>/g, '').trim()

      // Filter out short or empty paragraphs
      if (text.length < 20) return null

      return {
        id: `block-${index + 1}`,
        order: index + 1,
        text,
      }
    })
    .filter(Boolean) as Block[]

  return { title, blocks: blocks.length > 0 ? blocks : [{ id: 'block-1', order: 1, text: 'No readable content found.' }] }
}

// Placeholder for translation (will implement in translate API)
async function translateBlocks(blocks: Block[]): Promise<Block[]> {
  // TODO: Call /api/translate/batch
  return blocks.map(block => ({
    ...block,
    translation: '[Translation placeholder]',
  })) as any
}
