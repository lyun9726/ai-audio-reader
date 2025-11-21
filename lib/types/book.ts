// 书籍格式类型定义

export type BookFormat = 'pdf' | 'epub' | 'txt'

export interface BookMetadata {
  title: string
  author?: string
  language?: string
  publisher?: string
  isbn?: string
  coverUrl?: string
  pageCount?: number
  totalPages?: number
}

export interface ParsedBook {
  format: BookFormat
  metadata: BookMetadata
  // 原始文件 URL（用于渲染）
  fileUrl: string
  // 提取的文本段落（用于翻译和 TTS）
  paragraphs: BookParagraph[]
  // 原始数据（格式特定）
  rawData?: any
}

export interface BookParagraph {
  index: number
  text: string
  // PDF 特有：页码和位置
  page?: number
  bbox?: {
    x: number
    y: number
    width: number
    height: number
  }
  // EPUB 特有：章节信息
  chapter?: string
  href?: string
}

export interface BookParser {
  // 检测是否支持该格式
  canParse(file: File): boolean

  // 解析文件元数据
  parseMetadata(file: File): Promise<BookMetadata>

  // 提取文本内容
  extractParagraphs(file: File): Promise<BookParagraph[]>

  // 获取完整解析结果
  parse(file: File): Promise<ParsedBook>
}

export interface BookRenderer {
  format: BookFormat
  // 渲染器特定的配置
  config?: any
}
