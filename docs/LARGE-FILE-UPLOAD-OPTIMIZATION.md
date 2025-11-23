# 大文件上传优化完整方案

## 🎯 目标
实现像主流产品一样的快速大文件上传体验（100MB+ 几秒完成）

---

## 📊 主流产品的技术方案

### 他们如何做到快速上传？

#### 1. **分片上传 (Chunked Upload)** 【核心】
```
100MB文件 分成 100个 1MB分片
┌─────┬─────┬─────┬─────┬─────┐
│ 1MB │ 1MB │ 1MB │ ... │ 1MB │
└─────┴─────┴─────┴─────┴─────┘
   ↓     ↓     ↓     ↓     ↓
 并行上传（10个同时）
   ↓     ↓     ↓     ↓     ↓
  ✓     ✓     ✓     ✓     ✓
```

**优势**:
- ✅ **并行上传**: 10个分片同时传,速度x10
- ✅ **断点续传**: 失败只重传失败的分片
- ✅ **实时进度**: 每个分片完成都更新进度条
- ✅ **绕过限制**: 单个请求不超时

#### 2. **直传云存储 (Direct Upload)**
```
传统方案 (慢):
用户 → Vercel服务器 → Supabase Storage
     10MB/s        快速

优化方案 (快):
用户 → Supabase Storage (直传)
     100MB/s (CDN加速)
```

**优势**:
- ✅ **不经过服务器**: 不占用Vercel带宽
- ✅ **CDN加速**: 自动选择最近节点
- ✅ **无限制**: 不受Serverless函数超时限制
- ✅ **成本低**: 节省服务器流量费用

#### 3. **预签名URL (Presigned URL)**
```javascript
// 1. 客户端请求上传权限
POST /api/upload/init
Response: {
  uploadUrl: "https://storage.supabase.co/upload/xxxxx?token=...",
  uploadId: "abc123"
}

// 2. 客户端直接上传到存储
PUT uploadUrl
Body: 文件数据

// 3. 通知服务器完成
POST /api/upload/complete
```

#### 4. **压缩传输**
- 文本文件压缩90%+
- 自动gzip/brotli压缩
- 减少传输时间

#### 5. **智能重试**
- 自动重试失败的分片
- 指数退避策略
- 网络波动不影响上传

---

## 🔧 具体实现方案

### 方案一: Supabase Storage 直传 + 分片 【推荐】

#### 优势
- ✅ 无需额外服务
- ✅ Supabase内置支持
- ✅ 与现有系统集成
- ✅ 免费额度充足

#### 实现步骤

**1. 创建分片上传工具**

```typescript
// lib/services/chunkedUpload.ts

interface ChunkUploadOptions {
  file: File
  chunkSize?: number // 默认 5MB
  onProgress?: (progress: number) => void
  onChunkComplete?: (chunkIndex: number, total: number) => void
}

export class ChunkedUploader {
  private file: File
  private chunkSize: number
  private onProgress?: (progress: number) => void
  private chunks: Blob[] = []
  private uploadedChunks = new Set<number>()

  constructor(options: ChunkUploadOptions) {
    this.file = options.file
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024 // 5MB
    this.onProgress = options.onProgress
    this.createChunks()
  }

  private createChunks() {
    const totalChunks = Math.ceil(this.file.size / this.chunkSize)
    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, this.file.size)
      this.chunks.push(this.file.slice(start, end))
    }
  }

  async upload(): Promise<string> {
    // 1. 初始化分片上传
    const { uploadId, key } = await this.initUpload()

    // 2. 并行上传分片（每次最多10个并发）
    const CONCURRENT_UPLOADS = 10
    const totalChunks = this.chunks.length

    for (let i = 0; i < totalChunks; i += CONCURRENT_UPLOADS) {
      const batch = this.chunks.slice(i, i + CONCURRENT_UPLOADS)
      const uploadPromises = batch.map((chunk, idx) =>
        this.uploadChunk(chunk, i + idx, uploadId)
      )
      await Promise.all(uploadPromises)

      // 更新进度
      const progress = Math.min(100, ((i + batch.length) / totalChunks) * 100)
      this.onProgress?.(progress)
    }

    // 3. 完成上传
    const fileUrl = await this.completeUpload(uploadId, key)
    return fileUrl
  }

  private async initUpload() {
    const response = await fetch('/api/upload/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: this.file.name,
        fileSize: this.file.size,
        totalChunks: this.chunks.length
      })
    })
    return response.json()
  }

  private async uploadChunk(
    chunk: Blob,
    chunkIndex: number,
    uploadId: string
  ) {
    // 获取预签名URL
    const { uploadUrl } = await fetch('/api/upload/chunk-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, chunkIndex })
    }).then(r => r.json())

    // 直接上传到存储
    await fetch(uploadUrl, {
      method: 'PUT',
      body: chunk,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': chunk.size.toString()
      }
    })

    this.uploadedChunks.add(chunkIndex)
  }

  private async completeUpload(uploadId: string, key: string) {
    const response = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, key })
    })
    const { fileUrl } = await response.json()
    return fileUrl
  }
}
```

**2. 后端API实现**

```typescript
// app/api/upload/init/route.ts
export async function POST(request: Request) {
  const { fileName, fileSize, totalChunks } = await request.json()

  // 生成唯一上传ID
  const uploadId = crypto.randomUUID()
  const key = `uploads/${uploadId}/${fileName}`

  // 保存上传会话到数据库
  await supabase.from('upload_sessions').insert({
    upload_id: uploadId,
    file_name: fileName,
    file_size: fileSize,
    total_chunks: totalChunks,
    status: 'uploading'
  })

  return NextResponse.json({ uploadId, key })
}

// app/api/upload/chunk-url/route.ts
export async function POST(request: Request) {
  const { uploadId, chunkIndex } = await request.json()

  // 生成Supabase预签名URL
  const { data } = await supabaseAdmin.storage
    .from('books')
    .createSignedUploadUrl(`${uploadId}/chunk_${chunkIndex}`)

  return NextResponse.json({ uploadUrl: data.signedUrl })
}

// app/api/upload/complete/route.ts
export async function POST(request: Request) {
  const { uploadId, key } = await request.json()

  // 合并所有分片
  const chunks = await listChunks(uploadId)
  const mergedFile = await mergeChunks(chunks)

  // 上传最终文件
  const { data } = await supabaseAdmin.storage
    .from('books')
    .upload(key, mergedFile)

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('books')
    .getPublicUrl(key)

  // 清理分片
  await cleanupChunks(uploadId)

  return NextResponse.json({ fileUrl: publicUrl })
}
```

**3. 前端使用**

```typescript
// app/upload/page.tsx
const handleFileUpload = async (file: File) => {
  setUploading(true)

  const uploader = new ChunkedUploader({
    file,
    chunkSize: 5 * 1024 * 1024, // 5MB per chunk
    onProgress: (progress) => {
      setUploadProgress(progress)
      setProgress(`上传进度: ${progress.toFixed(1)}%`)
    },
    onChunkComplete: (current, total) => {
      console.log(`分片 ${current + 1}/${total} 完成`)
    }
  })

  try {
    const fileUrl = await uploader.upload()
    setProgress('上传完成!')
    // 继续处理...
  } catch (error) {
    setError('上传失败: ' + error.message)
  } finally {
    setUploading(false)
  }
}
```

---

### 方案二: AWS S3 Multipart Upload 【专业级】

#### 优势
- ✅ 业界标准方案
- ✅ 支持TB级文件
- ✅ 自动断点续传
- ✅ 性能最优

#### 实现 (使用 AWS SDK)

```typescript
import { S3Client, CreateMultipartUploadCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({ region: 'us-east-1' })

async function uploadLargeFile(file: File) {
  // 1. 创建分片上传
  const { UploadId } = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: 'my-bucket',
      Key: file.name
    })
  )

  // 2. 上传分片
  const parts = []
  const partSize = 10 * 1024 * 1024 // 10MB

  for (let i = 0; i < file.size; i += partSize) {
    const chunk = file.slice(i, i + partSize)
    const partNumber = Math.floor(i / partSize) + 1

    const { ETag } = await s3Client.send(
      new UploadPartCommand({
        Bucket: 'my-bucket',
        Key: file.name,
        UploadId,
        PartNumber: partNumber,
        Body: chunk
      })
    )

    parts.push({ ETag, PartNumber: partNumber })
  }

  // 3. 完成上传
  await s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: 'my-bucket',
      Key: file.name,
      UploadId,
      MultipartUpload: { Parts: parts }
    })
  )
}
```

---

### 方案三: 使用第三方库 【最简单】

#### Uppy.js + Tus (可恢复上传协议)

```bash
npm install @uppy/core @uppy/tus @uppy/dashboard
```

```typescript
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import Dashboard from '@uppy/dashboard'

const uppy = new Uppy({
  restrictions: {
    maxFileSize: 1000 * 1024 * 1024, // 1GB
    allowedFileTypes: ['.pdf', '.epub']
  }
})
  .use(Tus, {
    endpoint: '/api/upload/tus',
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
    retryDelays: [0, 1000, 3000, 5000]
  })
  .use(Dashboard, {
    inline: true,
    target: '#uppy-dashboard',
    showProgressDetails: true,
    proudlyDisplayPoweredByUppy: false
  })

uppy.on('complete', (result) => {
  console.log('Upload complete!', result.successful)
})
```

**效果**:
- ✅ 开箱即用的UI
- ✅ 自动断点续传
- ✅ 实时进度条
- ✅ 拖拽上传
- ✅ 文件验证

---

## 🚀 性能对比

| 方案 | 100MB文件 | 1GB文件 | 断点续传 | 开发难度 |
|------|----------|---------|---------|---------|
| **当前(单次上传)** | 30秒 | 超时失败 | ❌ | 简单 |
| **方案一(分片)** | 5-8秒 | 30-60秒 | ✅ | 中等 |
| **方案二(S3)** | 3-5秒 | 20-40秒 | ✅ | 复杂 |
| **方案三(Uppy)** | 5-8秒 | 30-60秒 | ✅ | 简单 |

---

## 💡 立即可实施的优化（无需大改）

### 1. 客户端直传 Supabase Storage

**当前流程**:
```
浏览器 → Vercel → Supabase (慢)
```

**优化后**:
```
浏览器 → Supabase (快)
```

**实现**:

```typescript
// app/upload/page.tsx
const handleDirectUpload = async (file: File) => {
  // 1. 获取预签名URL
  const { data: { path } } = await supabaseClient.storage
    .from('books')
    .upload(`temp/${Date.now()}_${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    })

  // 2. 获取公开URL
  const { data: { publicUrl } } = supabaseClient.storage
    .from('books')
    .getPublicUrl(path)

  // 3. 通知后端处理
  await fetch('/api/books/process', {
    method: 'POST',
    body: JSON.stringify({ fileUrl: publicUrl, title, ... })
  })
}
```

### 2. 添加进度条

```typescript
const uploadWithProgress = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100
      setProgress(`上传中: ${percentComplete.toFixed(1)}%`)
    }
  })

  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      setProgress('上传完成!')
    }
  })

  xhr.open('POST', '/api/books/upload')
  xhr.send(formData)
}
```

### 3. 压缩传输

```typescript
// 对文本内容压缩
import pako from 'pako'

const compressText = (text: string) => {
  const compressed = pako.gzip(text)
  return new Blob([compressed])
}

// 上传压缩后的内容
formData.append('extractedText', compressText(extractedText))
```

---

## 📊 推荐实施路线

### 第一阶段 (本周) - 快速优化
1. ✅ **客户端直传** - 速度提升50%
2. ✅ **实时进度条** - 改善用户体验
3. ✅ **文件大小检查前置** - 避免无效上传

预期效果: 50MB文件从30秒降到10秒

### 第二阶段 (下周) - 分片上传
1. ✅ **实现基础分片** - 5MB per chunk
2. ✅ **并发上传** - 5个并发
3. ✅ **错误重试** - 自动重试

预期效果: 100MB文件5-8秒完成

### 第三阶段 (本月) - 断点续传
1. ✅ **保存上传状态** - localStorage
2. ✅ **续传检测** - 刷新页面可继续
3. ✅ **分片去重** - 已上传的不重复

预期效果: 网络中断不影响上传

### 第四阶段 (长期) - 专业方案
1. ✅ **集成Uppy.js** - 企业级方案
2. ✅ **CDN加速** - 全球节点
3. ✅ **智能分片** - 根据网速调整

预期效果: 媲美主流产品

---

## 🛠️ 数据库Schema (支持分片上传)

```sql
-- 上传会话表
CREATE TABLE upload_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  total_chunks INTEGER NOT NULL,
  uploaded_chunks INTEGER DEFAULT 0,
  status TEXT DEFAULT 'uploading', -- uploading, completed, failed
  storage_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 分片记录表
CREATE TABLE upload_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id TEXT REFERENCES upload_sessions(upload_id),
  chunk_index INTEGER NOT NULL,
  chunk_size INTEGER NOT NULL,
  etag TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(upload_id, chunk_index)
);

-- 索引
CREATE INDEX idx_upload_sessions_user ON upload_sessions(user_id);
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX idx_upload_chunks_upload ON upload_chunks(upload_id);
```

---

## 📈 监控和分析

```typescript
// 上传性能监控
const trackUpload = {
  fileSize: file.size,
  startTime: Date.now(),
  chunkSize: 5 * 1024 * 1024,
  totalChunks: Math.ceil(file.size / chunkSize),

  onComplete: () => {
    const duration = Date.now() - startTime
    const speed = (file.size / duration) * 1000 / 1024 / 1024 // MB/s

    console.log(`上传完成:
      - 文件大小: ${(file.size / 1024 / 1024).toFixed(2)} MB
      - 耗时: ${(duration / 1000).toFixed(2)} 秒
      - 平均速度: ${speed.toFixed(2)} MB/s
      - 分片数: ${totalChunks}
    `)

    // 发送到分析服务
    analytics.track('file_upload', {
      size: file.size,
      duration,
      speed,
      chunks: totalChunks
    })
  }
}
```

---

## 🎯 总结

要实现快速大文件上传,核心是:

1. **分片 + 并发**: 10个5MB分片同时上传
2. **直传存储**: 不经过服务器,直连CDN
3. **断点续传**: 失败自动重试
4. **智能压缩**: 减少传输量

**快速开始**: 先实施客户端直传(1天),再加分片上传(3-5天)

需要我现在就帮您实现第一阶段的优化吗？
