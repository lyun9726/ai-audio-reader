# 📚 多格式电子书支持方案

## 📋 格式分类

让我把这些格式按特点分类：

### 第一类：主流格式（优先支持）⭐⭐⭐⭐⭐
```
PDF     - 最通用，排版固定
EPUB    - 电子书标准，可重排
MOBI    - Kindle 格式，类似 EPUB
AZW/AZW3/AZW4 - Kindle 专有格式
```
**用户占比**: 90%+

### 第二类：文本格式（容易支持）⭐⭐⭐⭐
```
TXT/TXTZ - 纯文本
HTML/HTM/HTMLZ - 网页格式
FB2     - FictionBook 格式（俄罗斯流行）
```
**用户占比**: 5-8%

### 第三类：漫画格式（特殊处理）⭐⭐⭐
```
CBZ/CBR/CBC - 漫画压缩包（图片集合）
```
**用户占比**: 2-5%

### 第四类：小众格式（低优先级）⭐
```
PDB/PRC - Palm OS
LRF/SNB - Sony Reader
PML     - eReader
RB      - RocketBook
CHM     - Windows Help
TCR     - Text Compression
```
**用户占比**: < 1%

---

## 🎯 推荐方案：统一处理架构

### 核心思路：**不转换，而是统一抽象**

```
用户上传
    ↓
格式检测
    ↓
┌─────────────────────────────────┐
│  格式解析层 (Format Parser)      │
│  ├─ PDF Parser                  │
│  ├─ EPUB Parser                 │
│  ├─ MOBI Parser                 │
│  ├─ AZW Parser                  │
│  ├─ TXT Parser                  │
│  └─ ...                         │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  统一数据结构                    │
│  {                              │
│    format: 'pdf' | 'epub' | ... │
│    metadata: {...}              │
│    content: [                   │
│      {                          │
│        type: 'text' | 'image'   │
│        data: ...                │
│        style: {...}             │
│      }                          │
│    ]                            │
│  }                              │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  渲染层 (Renderer)               │
│  ├─ PDF.js Renderer             │
│  ├─ EPUB.js Renderer            │
│  ├─ Universal Text Renderer     │
│  └─ Comic Viewer                │
└─────────────────────────────────┘
```

---

## 💡 具体实现方案

### 方案 1：多格式 → 统一文本提取 → 自定义渲染 ⭐⭐⭐⭐

**思路**：
- 所有格式都提取为文本 + 元数据
- 使用统一的阅读器渲染
- 翻译层不关心原格式

**优点**：
- ✅ 简单，复用现有代码
- ✅ 翻译和 TTS 逻辑统一
- ✅ 容易维护

**缺点**：
- ❌ 丢失原始排版
- ❌ 不能显示原文格式

**适合场景**：
- 主要关注内容阅读
- 不强调排版保留

---

### 方案 2：格式原生渲染 + 翻译叠加 ⭐⭐⭐⭐⭐ **（推荐）**

**思路**：
- PDF 用 PDF.js 原生渲染
- EPUB 用 EPUB.js 原生渲染
- 其他格式转换为支持的格式
- 翻译文本通过叠加层显示

**优点**：
- ✅ 保留原始排版
- ✅ 最佳阅读体验
- ✅ 专业级效果

**缺点**：
- ⚠️ 开发工作量大
- ⚠️ 需要多个渲染引擎

**适合场景**：
- 追求完美体验
- 专业阅读器

---

### 方案 3：混合方案（现实选择）⭐⭐⭐⭐⭐

**分层支持**：

#### 第 1 层：原生渲染（保留排版）
```
PDF  → PDF.js 渲染 + 翻译叠加
EPUB → EPUB.js 渲染 + 翻译叠加
```

#### 第 2 层：转换为标准格式
```
MOBI/AZW/AZW3 → 转为 EPUB → EPUB.js 渲染
```

#### 第 3 层：提取文本渲染
```
TXT/HTML/FB2 → 提取文本 → 自定义渲染器
CBZ/CBR → 提取图片 → 漫画阅读器
```

#### 第 4 层：不支持（提示用户）
```
PDB/LRF/CHM 等小众格式
→ 提示用户使用 Calibre 等工具转换为 PDF/EPUB
```

---

## 🛠️ 技术栈选择

### PDF 支持
```bash
npm install pdfjs-dist
```
**库**: PDF.js (Mozilla 开源)
**功能**:
- ✅ 完整 PDF 渲染
- ✅ 文本提取（含位置）
- ✅ 支持图片、表格
- ✅ 80MB+ 文件也能处理

**示例**:
```typescript
import * as pdfjsLib from 'pdfjs-dist'

// 渲染 PDF
const pdf = await pdfjsLib.getDocument(url).promise
const page = await pdf.getPage(1)
const viewport = page.getViewport({ scale: 1.5 })

// 提取文本（含位置）
const textContent = await page.getTextContent()
```

---

### EPUB 支持
```bash
npm install epubjs
```
**库**: EPUB.js
**功能**:
- ✅ 标准 EPUB 渲染
- ✅ 目录/书签/注释
- ✅ 字体/主题自定义
- ✅ 翻页动画

**示例**:
```typescript
import ePub from 'epubjs'

const book = ePub(url)
const rendition = book.renderTo('viewer', {
  width: '100%',
  height: '100%'
})

// 显示章节
await rendition.display()

// 提取文本
const section = book.spine.get(0)
const text = await section.load().then(doc => doc.textContent)
```

---

### MOBI/AZW 转换
```bash
npm install node-calibre  # 需要系统安装 Calibre
# 或者
npm install mobi  # 纯 JS 解析器（功能有限）
```

**方案 A**: 后端转换（推荐）
```bash
# 使用 Calibre 命令行工具
ebook-convert input.mobi output.epub
```

**方案 B**: 在线 API
```typescript
// 使用 CloudConvert API
const convertedUrl = await convertFile({
  from: 'mobi',
  to: 'epub',
  file: uploadedFile
})
```

---

### TXT/HTML 支持
**无需额外库**，直接处理：

```typescript
// TXT
const text = await file.text()
const paragraphs = text.split('\n\n').filter(p => p.trim())

// HTML
import { JSDOM } from 'jsdom'
const dom = new JSDOM(html)
const paragraphs = Array.from(dom.window.document.querySelectorAll('p'))
```

---

### CBZ/CBR（漫画）支持
```bash
npm install jszip  # CBZ 是 ZIP 压缩的图片
npm install unrar-js  # CBR 是 RAR 压缩的图片
```

**处理流程**:
```typescript
import JSZip from 'jszip'

// 解压 CBZ
const zip = await JSZip.loadAsync(file)
const images = []

zip.forEach((relativePath, file) => {
  if (/\.(jpg|jpeg|png|gif)$/i.test(relativePath)) {
    images.push({
      name: relativePath,
      data: file.async('base64')
    })
  }
})

// 按顺序显示图片
images.sort((a, b) => a.name.localeCompare(b.name))
```

---

## 📐 架构设计

### 文件结构
```
lib/
  ├─ parsers/
  │   ├─ pdf.ts          # PDF 解析器
  │   ├─ epub.ts         # EPUB 解析器
  │   ├─ mobi.ts         # MOBI 转换器
  │   ├─ txt.ts          # TXT 解析器
  │   ├─ html.ts         # HTML 解析器
  │   ├─ comic.ts        # CBZ/CBR 解析器
  │   └─ index.ts        # 格式检测 + 路由
  │
  ├─ renderers/
  │   ├─ PdfRenderer.tsx     # PDF.js 渲染
  │   ├─ EpubRenderer.tsx    # EPUB.js 渲染
  │   ├─ TextRenderer.tsx    # 通用文本渲染
  │   ├─ ComicRenderer.tsx   # 漫画渲染
  │   └─ index.tsx           # 渲染器选择
  │
  └─ types/
      └─ book.ts         # 统一数据结构
```

### 统一接口设计

```typescript
// lib/types/book.ts

export interface BookParser {
  // 检测是否支持该格式
  canParse(file: File): boolean

  // 解析文件
  parse(file: File): Promise<ParsedBook>

  // 提取文本（用于翻译）
  extractText(book: ParsedBook): Promise<string[]>
}

export interface ParsedBook {
  format: BookFormat
  metadata: {
    title: string
    author?: string
    language?: string
    cover?: string
  }
  content: BookContent
  rawData?: any  // 原始数据（用于渲染）
}

export type BookFormat =
  | 'pdf' | 'epub' | 'mobi' | 'azw' | 'azw3'
  | 'txt' | 'html' | 'fb2'
  | 'cbz' | 'cbr'

export type BookContent =
  | TextContent      // 纯文本
  | StructuredContent // 结构化内容（EPUB/HTML）
  | ImageContent     // 图片集（漫画）
  | BinaryContent    // 二进制（PDF/MOBI）
```

### 格式检测

```typescript
// lib/parsers/index.ts

import { PDFParser } from './pdf'
import { EPUBParser } from './epub'
import { MOBIParser } from './mobi'
// ...

const parsers: BookParser[] = [
  new PDFParser(),
  new EPUBParser(),
  new MOBIParser(),
  // ...
]

export async function detectAndParse(file: File): Promise<ParsedBook> {
  // 1. 根据扩展名快速判断
  const ext = file.name.split('.').pop()?.toLowerCase()

  // 2. 找到对应的解析器
  const parser = parsers.find(p => p.canParse(file))

  if (!parser) {
    throw new Error(`Unsupported format: ${ext}`)
  }

  // 3. 解析文件
  return await parser.parse(file)
}
```

### 渲染器选择

```typescript
// lib/renderers/index.tsx

export function BookRenderer({ book }: { book: ParsedBook }) {
  switch (book.format) {
    case 'pdf':
      return <PdfRenderer book={book} />

    case 'epub':
    case 'mobi':
    case 'azw':
    case 'azw3':
      return <EpubRenderer book={book} />

    case 'txt':
    case 'html':
    case 'fb2':
      return <TextRenderer book={book} />

    case 'cbz':
    case 'cbr':
      return <ComicRenderer book={book} />

    default:
      return <UnsupportedFormatMessage format={book.format} />
  }
}
```

---

## 🎯 实施计划

### 阶段 1：核心格式支持（1 周）
```
✅ PDF  - 使用 PDF.js
✅ EPUB - 使用 EPUB.js
✅ TXT  - 简单解析
```

### 阶段 2：Kindle 格式（3 天）
```
✅ MOBI/AZW → 转为 EPUB
✅ 服务端转换 or 在线 API
```

### 阶段 3：扩展格式（1 周）
```
✅ HTML/FB2 - 文本提取
✅ CBZ/CBR - 漫画阅读器
```

### 阶段 4：优化和抛光（持续）
```
✅ 性能优化（大文件处理）
✅ 缓存策略
✅ 错误处理
✅ 用户体验优化
```

---

## 💰 成本估算

### 开发成本
- **阶段 1**: 5-7 天（1 名开发）
- **阶段 2**: 3 天
- **阶段 3**: 5-7 天
- **总计**: 约 2-3 周

### 运行成本
- **服务端转换**（MOBI → EPUB）:
  - 使用 Calibre: 免费，但需服务器资源
  - 使用 CloudConvert API: $0.008/次转换

- **存储成本**:
  - 原文件: 按实际大小
  - 转换后文件: 可选（转换后删除原文件）

---

## 📊 格式支持优先级建议

基于用户需求和开发成本：

### 第 1 优先级（必须支持）⭐⭐⭐⭐⭐
```
PDF, EPUB
```
**覆盖率**: 70-80% 用户

### 第 2 优先级（重要）⭐⭐⭐⭐
```
MOBI, AZW, AZW3, TXT
```
**覆盖率**: 15-20% 用户

### 第 3 优先级（可选）⭐⭐⭐
```
HTML, FB2, CBZ, CBR
```
**覆盖率**: 5-8% 用户

### 第 4 优先级（按需）⭐
```
其他小众格式
```
**覆盖率**: < 2% 用户
**建议**: 提示用户用 Calibre 转换

---

## 🚀 快速启动方案

### 最小可行产品（MVP）

**第 1 天**: PDF 支持
```bash
npm install pdfjs-dist
# 实现 PDF 渲染 + 文本提取 + 翻译叠加
```

**第 2-3 天**: EPUB 支持
```bash
npm install epubjs
# 实现 EPUB 渲染 + 章节导航 + 翻译
```

**第 4 天**: TXT 支持
```typescript
// 简单文本解析 + 自定义渲染器
```

**第 5 天**: 格式检测 + 统一接口

**第 6-7 天**: 测试 + 优化

**1 周后**: 支持 90% 用户！🎉

---

## 🛡️ 格式转换方案对比

### 方案 A：客户端转换
**工具**: 纯 JavaScript 库
**优点**:
- ✅ 无服务器成本
- ✅ 隐私保护（文件不上传）

**缺点**:
- ❌ 浏览器性能限制
- ❌ 大文件可能失败
- ❌ 转换质量参差不齐

### 方案 B：服务端转换 ⭐⭐⭐⭐（推荐）
**工具**: Calibre CLI / Pandoc
**优点**:
- ✅ 转换质量高
- ✅ 支持大文件
- ✅ 格式兼容性好

**缺点**:
- ⚠️ 需要服务器资源
- ⚠️ 转换耗时（异步处理）

**实现**:
```typescript
// API: /api/books/convert
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function convertMobiToEpub(inputPath: string) {
  const outputPath = inputPath.replace('.mobi', '.epub')

  await execAsync(
    `ebook-convert "${inputPath}" "${outputPath}"`
  )

  return outputPath
}
```

### 方案 C：云端 API
**工具**: CloudConvert / Zamzar
**优点**:
- ✅ 无需维护转换器
- ✅ 高质量转换
- ✅ 支持所有格式

**缺点**:
- ⚠️ 按次收费
- ⚠️ 依赖第三方服务
- ⚠️ 隐私考虑

---

## 🎯 最终推荐

### 现实方案（平衡成本和体验）

```
格式              处理方式              开发难度   体验
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PDF              PDF.js 原生渲染        ⭐⭐⭐     ⭐⭐⭐⭐⭐
EPUB             EPUB.js 原生渲染       ⭐⭐⭐     ⭐⭐⭐⭐⭐
MOBI/AZW         转为 EPUB             ⭐⭐       ⭐⭐⭐⭐
TXT              自定义渲染器           ⭐         ⭐⭐⭐
HTML/FB2         提取文本渲染           ⭐⭐       ⭐⭐⭐
CBZ/CBR          漫画阅读器             ⭐⭐       ⭐⭐⭐⭐
其他             提示用户转换           -         ⭐
```

**覆盖率**: 95%+ 用户
**开发时间**: 2-3 周
**维护成本**: 低

---

## 📝 下一步

**想要我帮您实现哪个？**

1. **PDF.js 渲染器**（保留排版 + 翻译叠加）
2. **EPUB.js 阅读器**（专业电子书体验）
3. **统一格式检测系统**（自动识别所有格式）
4. **完整多格式支持架构**（全套解决方案）

告诉我您的选择，我立即开始！😊
