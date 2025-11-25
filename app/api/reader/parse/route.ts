import { NextRequest, NextResponse } from 'next/server'
import { ReaderEngine } from '@/lib/reader/ReaderEngine'
import { inMemoryDB } from '@/lib/storage/inMemoryDB'

interface ParseRequest {
  url?: string
  fileUrl?: string
  source?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ParseRequest = await req.json()
    const { url, fileUrl, source } = body

    const targetUrl = url || fileUrl || source

    if (!targetUrl) {
      return NextResponse.json({ error: 'url or source is required' }, { status: 400 })
    }

    // Demo path handling
    if (targetUrl.includes('/mnt/data/') || targetUrl.includes('5321c35c-86d2-43e9-b68d-8963068f3405')) {
      const bookId = 'demo-book-1'
      const parseResult = await ReaderEngine.parseFromUrl(targetUrl)

      inMemoryDB.saveBook({
        id: bookId,
        title: parseResult.metadata?.title || 'Demo Book',
        sourceUrl: targetUrl,
        blocks: parseResult.blocks,
      })

      return NextResponse.json({
        bookId,
        title: parseResult.metadata?.title,
        blocksCount: parseResult.blocks.length,
      })
    }

    // Real URL parsing
    const parseResult = await ReaderEngine.parseFromUrl(targetUrl)

    if (parseResult.metadata?.error) {
      return NextResponse.json(
        { error: parseResult.metadata.error },
        { status: 400 }
      )
    }

    const bookId = `book-${Date.now()}`

    inMemoryDB.saveBook({
      id: bookId,
      title: parseResult.metadata?.title || 'Untitled',
      sourceUrl: targetUrl,
      blocks: parseResult.blocks,
    })

    return NextResponse.json({
      bookId,
      title: parseResult.metadata?.title,
      blocksCount: parseResult.blocks.length,
    })
  } catch (error: any) {
    console.error('[Parse Error]', error)
    return NextResponse.json(
      { error: error.message || 'Parse failed' },
      { status: 500 }
    )
  }
}
