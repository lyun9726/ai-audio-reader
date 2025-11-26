/**
 * Parse API Route
 * Handles URL fetching and file parsing for the reader
 * Returns blocks directly for immediate rendering
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReaderEngine } from '@/lib/reader/ReaderEngine'

interface ParseUrlRequest {
  url: string
}

export async function POST(req: NextRequest) {
  try {
    // Check Content-Type to determine if it's a file upload or URL
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        )
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Determine file type from extension
      const fileName = file.name.toLowerCase()
      let fileType: 'pdf' | 'epub' | 'txt' | 'docx' | 'md' = 'txt'

      if (fileName.endsWith('.pdf')) fileType = 'pdf'
      else if (fileName.endsWith('.epub')) fileType = 'epub'
      else if (fileName.endsWith('.docx')) fileType = 'docx'
      else if (fileName.endsWith('.md')) fileType = 'md'
      else if (!fileName.endsWith('.txt')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unsupported file type. Supported: PDF, EPUB, TXT, DOCX, MD',
          },
          { status: 400 }
        )
      }

      // Parse file based on type
      let parseResult
      try {
        if (fileType === 'pdf' || fileType === 'epub') {
          // Use existing parsers
          parseResult = await ReaderEngine.parseFile(buffer, fileType)
        } else {
          // For text-based files, convert buffer to text
          const text = buffer.toString('utf-8')
          parseResult = ReaderEngine.parseText(text)
        }
      } catch (error: any) {
        console.error('[Parse] File parsing error:', error)
        return NextResponse.json(
          { success: false, error: `Failed to parse ${fileType.toUpperCase()} file` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        blocks: parseResult.blocks,
        metadata: parseResult.metadata,
      })
    } else {
      // Handle URL request
      const body: ParseUrlRequest = await req.json()
      const { url } = body

      if (!url) {
        return NextResponse.json(
          { success: false, error: 'URL is required' },
          { status: 400 }
        )
      }

      // Validate URL format
      try {
        new URL(url)
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid URL format' },
          { status: 400 }
        )
      }

      // Parse URL
      try {
        const parseResult = await ReaderEngine.parseFromUrl(url)

        if (parseResult.metadata?.error) {
          return NextResponse.json(
            { success: false, error: parseResult.metadata.error },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          blocks: parseResult.blocks,
          metadata: parseResult.metadata,
        })
      } catch (error: any) {
        console.error('[Parse] URL parsing error:', error)
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Failed to fetch and parse URL',
          },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error('[Parse API] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'Parse API',
    description: 'Parse URLs or files into reader blocks',
    endpoints: {
      POST: {
        urlParsing: {
          body: { url: 'https://example.com/article' },
          response: {
            success: true,
            blocks: [{ type: 'paragraph', text: '...', id: '...' }],
            metadata: { title: '...', author: '...' },
          },
        },
        fileParsing: {
          contentType: 'multipart/form-data',
          formData: { file: 'binary file data' },
          response: {
            success: true,
            blocks: [{ type: 'paragraph', text: '...', id: '...' }],
            metadata: { title: '...', author: '...' },
          },
        },
      },
    },
    supportedFileTypes: ['PDF', 'EPUB', 'TXT', 'DOCX', 'MD'],
  })
}
