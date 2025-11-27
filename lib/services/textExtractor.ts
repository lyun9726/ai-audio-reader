// Note: These libraries use CommonJS, so we import them dynamically
export interface ExtractedContent {
  text: string
  title?: string
  author?: string
  totalPages?: number
}

export interface Paragraph {
  chapter: number
  paraIdx: number
  text: string
}

/**
 * Extract text from PDF buffer using pdf-parse (works in Node.js serverless)
 */
export async function extractPdfText(buffer: Buffer): Promise<ExtractedContent> {
  try {
    console.log('[PDF Extract] Starting extraction, buffer size:', buffer.length, 'bytes')

    // Use pdf-parse which is more reliable for server-side Node.js
    const pdfParseModule = await import('pdf-parse')
    const pdfParse = pdfParseModule.default || pdfParseModule

    console.log('[PDF Extract] Parsing PDF document...')
    const data = await pdfParse(buffer)

    console.log('[PDF Extract] ✓ PDF parsed, pages:', data.numpages)
    console.log('[PDF Extract] Total text length:', data.text.length, 'characters')
    console.log('[PDF Extract] First 200 chars:', data.text.substring(0, 200))

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF contains no extractable text. It may be a scanned document (images only).')
    }

    return {
      text: data.text,
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      totalPages: data.numpages,
    }
  } catch (error: any) {
    console.error('[PDF Extract] Error:', error.message)
    console.error('[PDF Extract] Stack:', error.stack)
    throw new Error('Failed to extract text from PDF: ' + error.message)
  }
}

/**
 * Extract text from EPUB buffer
 */
export async function extractEpubText(buffer: Buffer): Promise<ExtractedContent> {
  return new Promise(async (resolve, reject) => {
    try {
      const EPubModule = await import('epub')
      const EPub = (EPubModule as any).default || EPubModule
      const epub = new EPub(buffer)

      epub.on('error', (err: any) => {
        console.error('EPUB parsing error:', err)
        reject(new Error('Failed to parse EPUB file'))
      })

      epub.on('end', async () => {
        try {
          const flow = epub.flow
          const textParts: string[] = []

          for (const chapter of flow) {
            const chapterText = await new Promise<string>((resolveChapter, rejectChapter) => {
              epub.getChapter(chapter.id, (err: any, text: string) => {
                if (err) rejectChapter(err)
                else resolveChapter(text)
              })
            })

            // Remove HTML tags
            const cleanText = chapterText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            if (cleanText) {
              textParts.push(cleanText)
            }
          }

          resolve({
            text: textParts.join('\n\n'),
            title: epub.metadata.title || undefined,
            author: epub.metadata.creator || undefined,
          })
        } catch (err) {
          reject(err)
        }
      })

      epub.parse()
    } catch (error) {
      console.error('EPUB extraction error:', error)
      reject(new Error('Failed to extract text from EPUB'))
    }
  })
}

/**
 * Split text into paragraphs
 * @param text - The full text to split
 * @param maxTokensPerParagraph - Maximum tokens per paragraph (approximate)
 */
export function splitIntoParagraphs(text: string, maxTokensPerParagraph = 800): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // Split by double newlines first (natural paragraphs)
  const naturalParagraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  let currentChapter = 1
  let paraIdx = 0

  for (const para of naturalParagraphs) {
    // Estimate tokens (rough: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil(para.length / 4)

    if (estimatedTokens <= maxTokensPerParagraph) {
      // Paragraph is within limit
      paragraphs.push({
        chapter: currentChapter,
        paraIdx: paraIdx++,
        text: para,
      })
    } else {
      // Split long paragraph by sentences
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para]
      let chunk = ''

      for (const sentence of sentences) {
        const testChunk = chunk + ' ' + sentence
        const testTokens = Math.ceil(testChunk.length / 4)

        if (testTokens <= maxTokensPerParagraph) {
          chunk = testChunk.trim()
        } else {
          if (chunk) {
            paragraphs.push({
              chapter: currentChapter,
              paraIdx: paraIdx++,
              text: chunk,
            })
          }
          chunk = sentence.trim()
        }
      }

      // Add remaining chunk
      if (chunk) {
        paragraphs.push({
          chapter: currentChapter,
          paraIdx: paraIdx++,
          text: chunk,
        })
      }
    }

    // Detect chapter changes (simple heuristic: if paragraph starts with "Chapter")
    if (para.match(/^Chapter\s+\d+/i)) {
      currentChapter++
    }
  }

  return paragraphs
}

/**
 * Main function to extract and process book content
 */
export async function processBookFile(
  buffer: Buffer,
  fileType: 'pdf' | 'epub'
): Promise<{ content: ExtractedContent; paragraphs: Paragraph[] }> {
  let content: ExtractedContent

  if (fileType === 'pdf') {
    content = await extractPdfText(buffer)
  } else if (fileType === 'epub') {
    content = await extractEpubText(buffer)
  } else {
    throw new Error('Unsupported file type')
  }

  const paragraphs = splitIntoParagraphs(content.text)

  return {
    content,
    paragraphs,
  }
}
