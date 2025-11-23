/**
 * 书籍封面提取工具 - 客户端版本
 * 只包含浏览器环境可用的函数
 */

/**
 * 客户端：从PDF文件提取第一页作为封面（浏览器环境）
 */
export async function extractPdfCoverClient(file: File): Promise<string | null> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    // 获取第一页
    const page = await pdf.getPage(1)

    // 设置合适的缩放比例
    const scale = 2.0
    const viewport = page.getViewport({ scale })

    // 创建canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return null

    canvas.width = viewport.width
    canvas.height = viewport.height

    // 渲染PDF页面
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise

    // 转换为DataURL
    return canvas.toDataURL('image/jpeg', 0.9)
  } catch (error) {
    console.error('[Cover Extract Client] 提取失败:', error)
    return null
  }
}

/**
 * 客户端：从EPUB文件提取封面（浏览器环境）
 * 注意：EPUB在浏览器中解析较复杂，建议在服务端处理
 */
export async function extractEpubCoverClient(file: File): Promise<string | null> {
  try {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const arrayBuffer = await file.arrayBuffer()
    const epub = await zip.loadAsync(arrayBuffer)

    // 读取container.xml找到content.opf位置
    const containerXml = await epub.file('META-INF/container.xml')?.async('text')
    if (!containerXml) return null

    // 简单解析XML找到rootfile路径
    const rootfileMatch = containerXml.match(/full-path="([^"]+)"/)
    if (!rootfileMatch) return null

    const contentOpfPath = rootfileMatch[1]
    const contentOpf = await epub.file(contentOpfPath)?.async('text')
    if (!contentOpf) return null

    // 查找封面图片引用
    const coverMatch = contentOpf.match(/<meta\s+name="cover"\s+content="([^"]+)"/)
    if (!coverMatch) {
      // 尝试查找第一个图片
      const imageMatch = contentOpf.match(/<item\s+[^>]*media-type="image\/[^"]+"\s+href="([^"]+)"/)
      if (!imageMatch) return null

      const imagePath = imageMatch[1]
      const opfDir = contentOpfPath.substring(0, contentOpfPath.lastIndexOf('/') + 1)
      const fullImagePath = opfDir + imagePath

      const imageFile = epub.file(fullImagePath)
      if (!imageFile) return null

      const imageData = await imageFile.async('base64')
      const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      return `data:${mimeType};base64,${imageData}`
    }

    const coverId = coverMatch[1]
    const itemMatch = contentOpf.match(new RegExp(`<item\\s+id="${coverId}"[^>]*href="([^"]+)"`))
    if (!itemMatch) return null

    const imagePath = itemMatch[1]
    const opfDir = contentOpfPath.substring(0, contentOpfPath.lastIndexOf('/') + 1)
    const fullImagePath = opfDir + imagePath

    const imageFile = epub.file(fullImagePath)
    if (!imageFile) return null

    const imageData = await imageFile.async('base64')
    const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

    return `data:${mimeType};base64,${imageData}`
  } catch (error) {
    console.error('[Cover Extract Client] EPUB封面提取失败:', error)
    return null
  }
}
