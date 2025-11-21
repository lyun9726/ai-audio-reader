# PDF/EPUB 功能部署指南

## 快速开始（3步）

### 第 1 步：应用数据库迁移

打开 Supabase Dashboard → SQL Editor，复制粘贴以下 SQL 并执行：

```sql
-- Add format column to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS format TEXT CHECK (format IN ('pdf', 'epub', 'txt'));

-- Add file_url column to store original file URL
ALTER TABLE books
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Update existing books to have pdf format (default)
UPDATE books SET format = 'pdf' WHERE format IS NULL;

-- Add metadata columns for better book information
ALTER TABLE books
ADD COLUMN IF NOT EXISTS page_count INTEGER,
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS isbn TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_books_format ON books(format);

-- Add page and location tracking to book_paragraphs for PDF/EPUB
ALTER TABLE book_paragraphs
ADD COLUMN IF NOT EXISTS page INTEGER,
ADD COLUMN IF NOT EXISTS bbox JSONB,  -- For PDF bounding boxes
ADD COLUMN IF NOT EXISTS chapter_title TEXT,
ADD COLUMN IF NOT EXISTS href TEXT;  -- For EPUB chapter hrefs

-- Update reading_progress to store location (CFI for EPUB)
ALTER TABLE reading_progress
ADD COLUMN IF NOT EXISTS location TEXT;  -- EPUB CFI or PDF page info

-- Add comment to explain columns
COMMENT ON COLUMN books.format IS 'File format: pdf, epub, or txt';
COMMENT ON COLUMN books.file_url IS 'URL to original uploaded file';
COMMENT ON COLUMN book_paragraphs.bbox IS 'PDF bounding box: {x, y, width, height}';
COMMENT ON COLUMN book_paragraphs.href IS 'EPUB chapter href for navigation';
COMMENT ON COLUMN reading_progress.location IS 'EPUB CFI or PDF location string';
```

✅ **执行成功标志**: 显示 "Success. No rows returned"

### 第 2 步：本地测试

```bash
cd D:\Users\Administrator\Desktop\ai-audio-reader

# 启动开发服务器
npm run dev
```

测试清单：
- [ ] 访问 http://localhost:3000
- [ ] 登录你的账号
- [ ] 上传一个 PDF 或 EPUB 文件
- [ ] 打开书籍，检查原生渲染是否正常
- [ ] 切换视图模式（原生/原文/译文/双语）
- [ ] 测试音频播放
- [ ] 测试翻译功能

### 第 3 步：部署到 Vercel

```bash
# 提交代码
git add .
git commit -m "feat: Add native PDF/EPUB rendering with format parsers

- Implement unified BookParser interface for format detection
- Add PdfRenderer and EpubRenderer components
- Upgrade Reader page to support native and paragraph views
- Enhance upload API to extract metadata and format info
- Add database migrations for format support
"

# 推送到 GitHub（会自动触发 Vercel 部署）
git push origin main
```

等待 Vercel 自动部署完成（约 2-3 分钟）

---

## 验证部署

### 验证清单：

#### 1. 数据库架构 ✅
```sql
-- 在 Supabase SQL Editor 中运行，检查新字段
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'books' AND column_name IN ('format', 'file_url', 'page_count');
```

应该返回 3 行结果。

#### 2. 上传测试 ✅

上传一个 PDF 文件，检查浏览器控制台：
```
[Upload] Parsing book: test.pdf
[Parser] Parsing PDF file: test.pdf
[Parser] ✓ Parsed in 1234ms, 156 paragraphs
[Upload] Parsed successfully: {format: 'pdf', paragraphs: 156, metadata: {...}}
```

#### 3. 阅读器测试 ✅

打开书籍后，检查：
- 原生 PDF 渲染显示正确
- 工具栏有缩放和导航按钮
- 视图切换按钮显示 "Native"
- 点击切换按钮可以切换到段落视图

#### 4. EPUB 测试 ✅

上传 EPUB 文件后：
- 左侧显示目录
- 字体大小可调节
- 主题切换按钮工作
- 文本选择功能正常

---

## 故障排查

### 问题 1: "column does not exist" 错误

**原因**: 数据库迁移未执行

**解决**:
```bash
# 手动在 Supabase Dashboard 执行 SQL
# 或使用 Supabase CLI
npx supabase db push
```

### 问题 2: PDF 显示空白

**原因**: PDF.js worker 未加载

**解决**: 检查 `lib/parsers/pdf.ts:6` 行的 CDN 配置：
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

### 问题 3: EPUB 无法打开

**原因**: EPUB 文件损坏或格式不标准

**解决**:
- 使用 Calibre 验证 EPUB 文件
- 尝试重新转换为 EPUB 格式

### 问题 4: 文件上传失败

**检查点**:
1. 文件大小是否超过 50MB
2. 文件格式是否为 PDF/EPUB
3. Supabase Storage 权限是否正确

### 问题 5: 视图切换无效

**原因**: `file_url` 字段为空

**检查**: 在数据库中确认 `books.file_url` 有值：
```sql
SELECT id, title, format, file_url FROM books LIMIT 5;
```

---

## 性能优化建议

### 1. PDF 渲染优化
```typescript
// 在 PdfRenderer.tsx 中调整缩放
const [scale, setScale] = useState(1.2) // 降低初始缩放
```

### 2. EPUB 预加载
```typescript
// 在 EpubRenderer.tsx 中启用预加载
await book.locations.generate(1024) // 生成位置索引
```

### 3. 大文件处理

对于超大文件（>20MB）：
- 提高上传限制（目前 50MB）
- 实现分页加载（PDF）
- 章节懒加载（EPUB）

---

## 文件位置参考

关键文件路径：
```
📁 ai-audio-reader/
├── 📁 lib/
│   ├── 📁 parsers/
│   │   ├── pdf.ts              ← PDF 解析逻辑
│   │   ├── epub.ts             ← EPUB 解析逻辑
│   │   └── index.ts            ← 格式检测
│   ├── 📁 components/
│   │   ├── PdfRenderer.tsx     ← PDF 渲染组件
│   │   └── EpubRenderer.tsx    ← EPUB 渲染组件
│   └── 📁 types/
│       └── book.ts             ← 类型定义
├── 📁 app/
│   ├── 📁 api/books/upload/
│   │   └── route.ts            ← 上传 API
│   └── 📁 reader/[bookId]/
│       └── page.tsx            ← 阅读器页面
└── 📁 supabase/migrations/
    └── 20250121000000_*.sql    ← 数据库迁移
```

---

## 下一步改进

### 短期（1-2 周）
- [ ] 翻译气泡：点击段落显示翻译
- [ ] 进度同步：在原生和段落视图间同步
- [ ] 书签功能：标记重要页面

### 中期（1 个月）
- [ ] MOBI/AZW 支持：添加 Kindle 格式
- [ ] 双语对照：PDF 并排显示
- [ ] 注释功能：高亮和笔记

### 长期（2-3 个月）
- [ ] 格式转换：集成 Calibre
- [ ] 离线支持：PWA 缓存
- [ ] 协作阅读：分享和讨论

---

## 技术支持

如遇到问题：
1. 检查浏览器控制台错误信息
2. 查看 `PDF_EPUB_IMPLEMENTATION_COMPLETE.md` 了解详细架构
3. 参考备份文件 `page_legacy_backup.tsx` 对比变更

🎉 享受新的 PDF/EPUB 阅读体验！
