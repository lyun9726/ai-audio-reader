/**
 * Pipeline API Route
 * Server-side endpoint for running the content pipeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { PipelineEngine } from '@/lib/pipeline/engine'
import { registerDefaultPlugins } from '@/lib/pipeline/plugins'
import type { PipelineSource, PipelineOptions } from '@/lib/pipeline/types'
import { saveBook } from '@/lib/storage/inMemoryDB'
import { getVectorStore } from '@/lib/storage/vectorStoreStub'

/**
 * SSRF protection - allowed URL patterns
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:']
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254', // AWS metadata
  'metadata.google.internal', // GCP metadata
]

/**
 * Validate URL for SSRF protection
 */
function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url)

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: `Protocol not allowed: ${parsedUrl.protocol}`,
      }
    }

    // Check for blocked hosts
    const hostname = parsedUrl.hostname.toLowerCase()
    for (const blocked of BLOCKED_HOSTS) {
      if (hostname === blocked || hostname.endsWith(`.${blocked}`)) {
        return {
          valid: false,
          error: `Host not allowed: ${hostname}`,
        }
      }
    }

    // Check for private IP ranges
    if (isPrivateIP(hostname)) {
      return {
        valid: false,
        error: `Private IP addresses not allowed: ${hostname}`,
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: `Invalid URL: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Check if hostname is a private IP address
 */
function isPrivateIP(hostname: string): boolean {
  // Check for IPv4 private ranges
  const ipv4PrivateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
  ]

  for (const range of ipv4PrivateRanges) {
    if (range.test(hostname)) {
      return true
    }
  }

  // Check for IPv6 private addresses
  if (hostname.startsWith('fe80:') || hostname.startsWith('fc00:')) {
    return true
  }

  return false
}

/**
 * Generate unique book ID
 */
function generateBookId(): string {
  return `pipeline-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

/**
 * POST /api/pipeline/run
 * Run pipeline on a source
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, options } = body as {
      source: PipelineSource
      options?: PipelineOptions
    }

    // Validate request
    if (!source || !source.type || !source.url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: source.type and source.url are required',
        },
        { status: 400 }
      )
    }

    // SSRF protection - validate URL if it's a URL type
    if (source.type === 'url') {
      const validation = validateUrl(source.url)
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: `URL validation failed: ${validation.error}`,
          },
          { status: 400 }
        )
      }
    }

    // Allow demo file path without validation
    const DEMO_FILE_PATH = '/mnt/data/9f3a4491-8585-454a-87a0-642067c922df.png'
    if (source.url !== DEMO_FILE_PATH && source.type === 'file') {
      // For non-demo files, you might want to implement file path validation
      // For now, we'll allow it but in production you should validate
      console.warn('[Pipeline API] Non-demo file path accessed:', source.url)
    }

    // Create and configure pipeline engine
    const engine = new PipelineEngine()
    registerDefaultPlugins(engine)

    // Run pipeline
    const result = await engine.run(source, options)

    // Generate book ID
    const bookId = generateBookId()

    // Save to in-memory database
    saveBook({
      id: bookId,
      title: `Pipeline Book ${bookId}`,
      sourceUrl: source.url,
      blocks: result.blocks,
    })

    // Save vectors to vector store if available
    let vectorCount = 0
    if (result.vectors && result.vectors.length > 0) {
      const vectorStore = getVectorStore()
      vectorStore.save(result.vectors)
      vectorCount = result.vectors.length
    }

    // Return success response
    return NextResponse.json({
      success: true,
      bookId,
      blocksCount: result.blocks.length,
      vectorCount,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('[Pipeline API] Error:', error)

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
 * GET /api/pipeline/run
 * Get API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/pipeline/run',
    method: 'POST',
    description: 'Run the content pipeline on a source',
    body: {
      source: {
        type: 'url | file | image | pdf | epub',
        url: 'string',
      },
      options: {
        enableVectorization: 'boolean (optional)',
        enableCleaning: 'boolean (optional)',
        enableEnrichment: 'boolean (optional)',
        metadata: 'object (optional)',
      },
    },
    response: {
      success: 'boolean',
      bookId: 'string',
      blocksCount: 'number',
      vectorCount: 'number',
      metadata: 'object',
    },
  })
}
