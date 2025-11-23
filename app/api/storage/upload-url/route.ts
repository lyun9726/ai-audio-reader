import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 生成预签名上传URL
 * 允许客户端直接上传到Supabase Storage
 */
export async function POST(request: Request) {
  try {
    // 验证用户身份
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 解析请求
    const { bucket, path, contentType } = await request.json()

    if (!bucket || !path) {
      return NextResponse.json(
        { error: 'Missing required fields: bucket, path' },
        { status: 400 }
      )
    }

    // 创建service role客户端
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 生成预签名上传URL
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path)

    if (error) {
      console.error('[Upload URL] Error creating signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path)

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      publicUrl,
      path,
      expiresIn: 3600 // 1小时有效期
    })
  } catch (error: any) {
    console.error('[Upload URL] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
