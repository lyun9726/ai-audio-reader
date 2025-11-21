import { BookParser, ParsedBook, BookFormat } from '@/lib/types/book'
import { PDFParser } from './pdf'
import { EPUBParser } from './epub'

// 注册所有解析器
const parsers: BookParser[] = [
  new PDFParser(),
  new EPUBParser(),
]

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
 * 解析文件
 */
export async function parseBook(file: File): Promise<ParsedBook> {
  // 1. 检测格式
  const format = detectFormat(file)

  if (!format) {
    throw new Error(`Unsupported file format: ${file.name}`)
  }

  // 2. 找到对应的解析器
  const parser = parsers.find(p => p.canParse(file))

  if (!parser) {
    throw new Error(`No parser found for format: ${format}`)
  }

  // 3. 解析文件
  console.log(`[Parser] Parsing ${format.toUpperCase()} file:`, file.name)
  const startTime = Date.now()

  const result = await parser.parse(file)

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
