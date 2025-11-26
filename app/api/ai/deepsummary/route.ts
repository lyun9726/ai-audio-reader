/**
 * Deep Summary API Route
 * Generates layered summaries with multiple granularity levels
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateSummary, streamDetailedSummary, type SummaryLevel } from '@/lib/ai/summaryGenerator'
import type { ReaderBlock } from '@/lib/types'

/**
 * POST /api/ai/deepsummary
 * Generate summary from blocks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, blocks, level = 'short' } = body as {
      bookId: string
      blocks: ReaderBlock[]
      level?: SummaryLevel
    }

    // Validate input
    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { success: false, error: 'Blocks array is required' },
        { status: 400 }
      )
    }

    // Check if we should use LLM (API key available)
    const hasAPIKey = !!(
      process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
    )

    // For 'detailed' level with streaming support
    if (level === 'detailed' && request.headers.get('accept')?.includes('text/event-stream')) {
      // Stream response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamDetailedSummary(blocks)) {
              const data = `data: ${JSON.stringify({ chunk })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Generate summary
    const result = await generateSummary(blocks, level, hasAPIKey)

    return NextResponse.json({
      success: true,
      bookId,
      result,
      demo: !hasAPIKey,
    })
  } catch (error) {
    console.error('[Deep Summary API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/deepsummary
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/deepsummary',
    method: 'POST',
    description: 'Generate layered summaries with multiple granularity levels',
    body: {
      bookId: 'string',
      blocks: 'ReaderBlock[]',
      level: 'oneLine | short | detailed | chapterOutlines (optional, default: short)',
    },
    levels: {
      oneLine: '1 sentence high-level summary',
      short: '3 bullet key points',
      detailed: '200-400 word summary with structure (supports streaming)',
      chapterOutlines: 'Array of chapter titles with outlines',
    },
    streaming: {
      note: 'For detailed summaries, set Accept: text/event-stream header for streaming',
    },
    response: {
      success: 'boolean',
      bookId: 'string',
      result: {
        level: 'string',
        content: 'string | ChapterOutline[]',
        metadata: 'object',
      },
      demo: 'boolean (true if using mock data)',
    },
  })
}
