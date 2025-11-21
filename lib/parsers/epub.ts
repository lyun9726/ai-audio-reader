import ePub from 'epubjs'
import { BookParser, BookMetadata, BookParagraph, ParsedBook } from '@/lib/types/book'

export class EPUBParser implements BookParser {
  canParse(file: File): boolean {
    return (
      file.type === 'application/epub+zip' ||
      file.name.toLowerCase().endsWith('.epub')
    )
  }

  async parseMetadata(file: File): Promise<BookMetadata> {
    const arrayBuffer = await file.arrayBuffer()
    const book = ePub(arrayBuffer)

    await book.ready

    return {
      title: book.packaging.metadata.title || file.name.replace('.epub', ''),
      author: book.packaging.metadata.creator,
      language: book.packaging.metadata.language,
      publisher: book.packaging.metadata.publisher,
      isbn: book.packaging.metadata.identifier,
    }
  }

  async extractParagraphs(file: File): Promise<BookParagraph[]> {
    const arrayBuffer = await file.arrayBuffer()
    const book = ePub(arrayBuffer)

    await book.ready
    await book.locations.generate(1024) // 生成位置信息

    const paragraphs: BookParagraph[] = []
    let globalIndex = 0

    // 遍历每个章节
    const spine = book.spine as any
    for (const section of spine.spineItems || spine) {
      try {
        // 加载章节内容
        await section.load(book.load.bind(book))
        const contents = section.document || section.output

        if (!contents) continue

        // 提取段落
        let chapterTitle = section.idref || section.href

        // 尝试获取章节标题
        const headings = contents.querySelectorAll('h1, h2, h3, h4, h5, h6')
        if (headings.length > 0) {
          chapterTitle = headings[0].textContent?.trim() || chapterTitle
        }

        // 提取所有段落
        const pElements = contents.querySelectorAll('p')

        for (const p of Array.from(pElements) as Element[]) {
          const text = (p as any).textContent?.trim()

          if (text && text.length > 20) {
            paragraphs.push({
              index: globalIndex++,
              text,
              chapter: chapterTitle,
              href: section.href,
            })
          }
        }

        // 如果没有 <p> 标签，尝试提取 div 或其他文本
        if (pElements.length === 0) {
          const bodyText = contents.body?.textContent?.trim()
          if (bodyText && bodyText.length > 50) {
            // 简单按句号分割
            const sentences = bodyText.split(/[.。!！?？]\s+/).filter((s: string) => s.trim().length > 20)

            for (const sentence of sentences) {
              paragraphs.push({
                index: globalIndex++,
                text: sentence.trim() + '.',
                chapter: chapterTitle,
                href: section.href,
              })
            }
          }
        }
      } catch (error) {
        console.error(`Failed to parse section ${section.href}:`, error)
      }
    }

    return paragraphs
  }

  async parse(file: File): Promise<ParsedBook> {
    const fileUrl = URL.createObjectURL(file)
    const metadata = await this.parseMetadata(file)
    const paragraphs = await this.extractParagraphs(file)

    return {
      format: 'epub',
      metadata,
      fileUrl,
      paragraphs,
    }
  }
}
