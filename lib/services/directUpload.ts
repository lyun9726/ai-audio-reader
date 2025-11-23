/**
 * 客户端直传到 Supabase Storage
 * 绕过服务器,速度更快
 */

import { createClient } from '@/lib/supabase/client'

export interface DirectUploadOptions {
  file: File
  bucket?: string
  path?: string
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
}

export interface DirectUploadResult {
  path: string
  publicUrl: string
  fullPath: string
}

/**
 * 直接上传文件到Supabase Storage
 * 使用XMLHttpRequest以支持进度追踪
 */
export async function directUploadToStorage(
  options: DirectUploadOptions
): Promise<DirectUploadResult> {
  const {
    file,
    bucket = 'books',
    path,
    onProgress,
    onError
  } = options

  const supabase = createClient()

  // 生成文件路径
  const timestamp = Date.now()
  const sanitizedName = file.name
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)

  const filePath = path || `uploads/${timestamp}_${sanitizedName}`

  try {
    // 使用Supabase客户端上传(支持进度回调)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        // 不幸的是,Supabase JS SDK不直接支持进度回调
        // 我们需要使用XMLHttpRequest的方式
      })

    if (error) {
      throw error
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      path: filePath,
      publicUrl,
      fullPath: data.path
    }
  } catch (error: any) {
    onError?.(error)
    throw error
  }
}

/**
 * 使用XMLHttpRequest实现带进度的上传
 * 需要先获取预签名URL
 */
export async function directUploadWithProgress(
  options: DirectUploadOptions
): Promise<DirectUploadResult> {
  const {
    file,
    bucket = 'books',
    path,
    onProgress,
    onError
  } = options

  // 生成文件路径
  const timestamp = Date.now()
  const sanitizedName = file.name
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)

  const filePath = path || `uploads/${timestamp}_${sanitizedName}`

  try {
    // 1. 获取预签名上传URL
    const response = await fetch('/api/storage/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bucket,
        path: filePath,
        contentType: file.type || 'application/octet-stream'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get upload URL')
    }

    const { uploadUrl, publicUrl } = await response.json()

    // 2. 使用XMLHttpRequest上传以追踪进度
    await uploadWithProgress(uploadUrl, file, onProgress)

    return {
      path: filePath,
      publicUrl,
      fullPath: filePath
    }
  } catch (error: any) {
    onError?.(error)
    throw error
  }
}

/**
 * 使用XMLHttpRequest上传并追踪进度
 */
function uploadWithProgress(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // 进度事件
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100
        onProgress?.(percentComplete)
      }
    })

    // 完成事件
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    // 错误事件
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    // 超时事件
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'))
    })

    // 开始上传
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.timeout = 10 * 60 * 1000 // 10分钟超时
    xhr.send(file)
  })
}

/**
 * 简化版：直接使用Supabase客户端上传
 * 适合小文件(<10MB)
 */
export async function simpleDirectUpload(
  file: File,
  userId?: string
): Promise<DirectUploadResult> {
  const supabase = createClient()

  const timestamp = Date.now()
  const sanitizedName = file.name
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)

  const filePath = userId
    ? `${userId}/${timestamp}_${sanitizedName}`
    : `uploads/${timestamp}_${sanitizedName}`

  const { data, error } = await supabase.storage
    .from('books')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('books')
    .getPublicUrl(filePath)

  return {
    path: filePath,
    publicUrl,
    fullPath: data.path
  }
}
