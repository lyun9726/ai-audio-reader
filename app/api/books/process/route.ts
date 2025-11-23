import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { detectFormat } from '@/lib/parsers'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

/**
 * 处理已上传的文件
 * 文件已经在Storage中,只需提取文本并创建书籍记录
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 检查认证
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 解析表单数据
    const formData = await request.formData()
    const fileUrl = formData.get('fileUrl') as string
    const filePath = formData.get('filePath') as string
    const title = formData.get('title') as string
    const author = formData.get('author') as string || null
    const description = formData.get('description') as string || null
    const sourceLang = formData.get('sourceLang') as string || 'en'
    const targetLang = formData.get('targetLang') as string || 'zh'
    const extractedText = formData.get('extractedText') as string || null
    const coverPreview = formData.get('coverPreview') as string || null

    if (!fileUrl || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[Process] Processing file:', fileUrl)

    // 从URL推断格式
    const format = fileUrl.endsWith('.epub') ? 'epub' :
                   fileUrl.endsWith('.pdf') ? 'pdf' : 'txt'

    // 创建service role客户端
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 上传封面（如果有）
    let coverUrl: string | null = null
    if (coverPreview) {
      try {
        const base64Data = coverPreview.replace(/^data:image\/\w+;base64,/, '')
        const coverBuffer = Buffer.from(base64Data, 'base64')

        const coverFileName = `${user.id}/covers/${Date.now()}_cover.jpg`
        const { error: coverError } = await supabaseAdmin.storage
          .from('books')
          .upload(coverFileName, coverBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
          })

        if (!coverError) {
          const { data: { publicUrl: coverPublicUrl } } = supabaseAdmin.storage
            .from('books')
            .getPublicUrl(coverFileName)

          coverUrl = coverPublicUrl
          console.log('[Process] Cover uploaded to:', coverUrl)
        }
      } catch (coverErr) {
        console.error('[Process] Cover upload failed:', coverErr)
      }
    }

    // 处理文本和段落
    let totalParagraphs = 0
    let extractedAuthor = author

    if (format === 'pdf' || format === 'epub') {
      try {
        let fullText = extractedText

        // 如果没有提取的文本,需要下载文件并提取
        if (!fullText && format === 'epub') {
          console.log('[Process] Downloading file for text extraction...')
          const fileResponse = await fetch(fileUrl)
          const arrayBuffer = await fileResponse.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const { processBookFile } = await import('@/lib/services/textExtractor')
          const { content } = await processBookFile(buffer, format)
          fullText = content.text
          extractedAuthor = extractedAuthor || content.author || null
        }

        if (!fullText || fullText.trim().length === 0) {
          throw new Error('No text extracted from file')
        }

        // 分段
        const { splitIntoParagraphs } = await import('@/lib/services/textExtractor')
        const paragraphs = splitIntoParagraphs(fullText)
        totalParagraphs = paragraphs.length

        console.log('[Process] Split into', totalParagraphs, 'paragraphs')

        // 创建书籍记录
        const { data: book, error: bookError } = await supabase
          .from('books')
          .insert({
            owner_user_id: user.id,
            title,
            author: extractedAuthor,
            description,
            original_lang: sourceLang,
            target_lang: targetLang,
            status: 'ready',
            format,
            file_url: fileUrl,
            s3_original_url: fileUrl,
            cover_url: coverUrl,
            total_chapters: 1,
            total_paragraphs: totalParagraphs,
          })
          .select()
          .single()

        if (bookError) {
          console.error('[Process] Error creating book:', bookError)
          return NextResponse.json(
            { error: 'Failed to create book record' },
            { status: 500 }
          )
        }

        // 插入段落
        console.log('[Process] Saving paragraphs to database...')
        const paragraphRecords = paragraphs.map(p => ({
          book_id: book.id,
          chapter: p.chapter,
          para_idx: p.paraIdx,
          text_original: p.text,
        }))

        const BATCH_SIZE = 100
        for (let i = 0; i < paragraphRecords.length; i += BATCH_SIZE) {
          const batch = paragraphRecords.slice(i, i + BATCH_SIZE)
          const { error: parasError } = await supabase
            .from('book_paragraphs')
            .insert(batch)

          if (parasError) {
            console.error('[Process] Error inserting paragraphs:', parasError)
          }
        }

        console.log('[Process] ✓ Book created successfully:', book.id)

        return NextResponse.json({
          success: true,
          book: {
            id: book.id,
            title: book.title,
            format: book.format,
            fileUrl,
            totalParagraphs,
          },
        })
      } catch (extractError: any) {
        console.error('[Process] Text extraction failed:', extractError)
        return NextResponse.json(
          {
            error: 'Text extraction failed: ' + extractError.message,
            details: 'Unable to extract text from this file.',
          },
          { status: 500 }
        )
      }
    }

    // 简单格式(TXT)
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        owner_user_id: user.id,
        title,
        author: extractedAuthor,
        description,
        original_lang: sourceLang,
        target_lang: targetLang,
        status: 'ready',
        format,
        file_url: fileUrl,
        s3_original_url: fileUrl,
        cover_url: coverUrl,
        total_chapters: 1,
        total_paragraphs: 0,
      })
      .select()
      .single()

    if (bookError) {
      console.error('[Process] Error creating book:', bookError)
      return NextResponse.json(
        { error: 'Failed to create book record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        format: book.format,
        fileUrl,
      },
    })
  } catch (error: any) {
    console.error('[Process] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    )
  }
}
