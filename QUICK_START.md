# 🚀 PDF/EPUB 功能快速启动（3 分钟）

## 第 1 步：数据库（1 分钟）

1. 打开：https://supabase.com/dashboard
2. 选择你的项目
3. 左侧菜单：**SQL Editor**
4. 点击 **New Query**
5. 复制粘贴并运行：

```sql
ALTER TABLE books ADD COLUMN IF NOT EXISTS format TEXT CHECK (format IN ('pdf', 'epub', 'txt'));
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS isbn TEXT;

ALTER TABLE book_paragraphs ADD COLUMN IF NOT EXISTS page INTEGER;
ALTER TABLE book_paragraphs ADD COLUMN IF NOT EXISTS bbox JSONB;
ALTER TABLE book_paragraphs ADD COLUMN IF NOT EXISTS chapter_title TEXT;
ALTER TABLE book_paragraphs ADD COLUMN IF NOT EXISTS href TEXT;

ALTER TABLE reading_progress ADD COLUMN IF NOT EXISTS location TEXT;

CREATE INDEX IF NOT EXISTS idx_books_format ON books(format);
```

6. 看到 "Success" ✅

---

## 第 2 步：测试（1 分钟）

```bash
npm run dev
```

1. 访问 http://localhost:3000
2. 上传一个 PDF 或 EPUB 文件
3. 打开书籍
4. 看到原始格式渲染 ✅

---

## 第 3 步：部署（1 分钟）

```bash
git add .
git commit -m "feat: Add native PDF/EPUB rendering"
git push origin main
```

等待 Vercel 自动部署（2-3 分钟）

---

## ✅ 完成！

访问你的网站，上传 PDF/EPUB，享受专业阅读体验！

---

## 📚 详细文档

- 技术详情：`PDF_EPUB_IMPLEMENTATION_COMPLETE.md`
- 部署指南：`SETUP_PDF_EPUB.md`
- 功能总结：`IMPLEMENTATION_SUMMARY.md`
- 检查清单：`DEPLOYMENT_CHECKLIST.md`

---

## 🆘 遇到问题？

1. 查看浏览器控制台（F12）
2. 检查 Vercel 部署日志
3. 参考 `SETUP_PDF_EPUB.md` 故障排查

---

**完成时间**: 3 分钟
**新功能**: PDF + EPUB 原生渲染
**兼容性**: 保留所有现有功能

🎉 朋友的需求已实现！
