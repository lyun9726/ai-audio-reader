import { BookParser, BookMetadata, BookParagraph, ParsedBook } from '@/lib/types/book'

// Dynamically import pdfjs only in browser environment
let pdfjsLib: typeof import('pdfjs-dist') | null = null
if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((lib) => {
    pdfjsLib = lib
    lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`
  })
}

export class PDFParser implements BookParser {
  canParse(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  }

  async parseMetadata(file: File): Promise<BookMetadata> {
    if (!pdfjsLib) {
      pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const metadata = await pdf.getMetadata()
    const info = metadata.info as any

    return {
      title: info?.Title || file.name.replace('.pdf', ''),
      author: info?.Author,
      language: info?.Language,
      publisher: info?.Producer,
      pageCount: pdf.numPages,
      totalPages: pdf.numPages,
    }
  }

  async extractParagraphs(file: File): Promise<BookParagraph[]> {
    if (!pdfjsLib) {
      pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const paragraphs: BookParagraph[] = []
    let globalIndex = 0

    // 遍历每一页
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // 提取文本项
      let currentParagraph = ''
      let currentBbox: any = null

      for (const item of textContent.items as any[]) {
        if (!item.str) continue

        const text = item.str.trim()
        if (!text) continue

        // 检测段落结束（换行或较大间距）
        const isNewParagraph =
          text.endsWith('.') ||
          text.endsWith('。') ||
          text.endsWith('!') ||
          text.endsWith('！') ||
          text.endsWith('?') ||
          text.endsWith('？')

        currentParagraph += text + ' '

        // 记录第一个文本项的位置
        if (!currentBbox && item.transform) {
          currentBbox = {
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height,
          }
        }

        if (isNewParagraph && currentParagraph.length > 20) {
          paragraphs.push({
            index: globalIndex++,
            text: currentParagraph.trim(),
            page: pageNum,
            bbox: currentBbox,
          })

          currentParagraph = ''
          currentBbox = null
        }
      }

      // 如果页面结束还有剩余文本
      if (currentParagraph.trim().length > 20) {
        paragraphs.push({
          index: globalIndex++,
          text: currentParagraph.trim(),
          page: pageNum,
          bbox: currentBbox,
        })
      }
    }

    return paragraphs
  }

  async parse(file: File): Promise<ParsedBook> {
    const fileUrl = URL.createObjectURL(file)
    const metadata = await this.parseMetadata(file)
    const paragraphs = await this.extractParagraphs(file)

    return {
      format: 'pdf',
      metadata,
      fileUrl,
      paragraphs,
    }
  }
}
