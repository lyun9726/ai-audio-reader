import { BookParser, ParsedBook, BookFormat } from '@/lib/types/book'

/**
 * 检测文件格式
 */
export function detectFormat(file: File): BookFormat | null {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()

  // PDF
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'pdf'
  }

  // EPUB
  if (fileType === 'application/epub+zip' || fileName.endsWith('.epub')) {
    return 'epub'
  }

  // TXT
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return 'txt'
  }

  return null
}

/**
 * 解析文件（仅在客户端使用）
 * 服务器端不调用此函数，避免 DOM 依赖问题
 */
export async function parseBook(file: File): Promise<ParsedBook> {
  // 动态导入解析器（仅在浏览器环境）
  if (typeof window === 'undefined') {
    throw new Error('parseBook can only be called in browser environment')
  }

  const format = detectFormat(file)
  if (!format) {
    throw new Error(`Unsupported file format: ${file.name}`)
  }

  console.log(`[Parser] Parsing ${format.toUpperCase()} file:`, file.name)
  const startTime = Date.now()

  let result: ParsedBook

  if (format === 'pdf') {
    const { PDFParser } = await import('./pdf')
    const parser = new PDFParser()
    result = await parser.parse(file)
  } else if (format === 'epub') {
    const { EPUBParser } = await import('./epub')
    const parser = new EPUBParser()
    result = await parser.parse(file)
  } else {
    // TXT
    const text = await file.text()
    const paragraphs = text.split(/\n\n+/)
      .filter(p => p.trim().length > 20)
      .map((text, index) => ({
        index,
        text: text.trim(),
      }))

    result = {
      format: 'txt',
      metadata: {
        title: file.name.replace('.txt', ''),
      },
      fileUrl: URL.createObjectURL(file),
      paragraphs,
    }
  }

  const duration = Date.now() - startTime
  console.log(`[Parser] ✓ Parsed in ${duration}ms, ${result.paragraphs.length} paragraphs`)

  return result
}

/**
 * 获取支持的格式列表
 */
export function getSupportedFormats(): string[] {
  return ['PDF', 'EPUB', 'TXT']
}

/**
 * 检查文件是否支持
 */
export function isFormatSupported(file: File): boolean {
  return detectFormat(file) !== null
}
