# 调试上传错误："Failed to upload file to storage"

## 问题分析

这个错误发生在服务器尝试上传文件到 Supabase Storage 时。可能的原因：

### 1. 环境变量未配置（最可能）⭐

Vercel 部署时需要配置环境变量。

**检查方法**：
1. 打开 https://vercel.com/dashboard
2. 选择你的项目 `ai-audio-reader`
3. 进入 **Settings** → **Environment Variables**
4. 确认以下变量存在：
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   OPENAI_BASE_URL
   ```

**如果缺少，请添加**（从本地 `.env.local` 复制）：
- Production, Preview, Development 三个环境都要勾选

---

### 2. RLS 策略问题

虽然我们的诊断脚本显示 Storage 正常，但可能是用户权限问题。

**检查方法**：
1. 打开浏览器开发者工具（F12）
2. 上传文件时查看 **Console** 和 **Network** 标签
3. 找到失败的请求，查看详细错误信息

**可能的错误**：
- `new row violates row-level security policy` - RLS 策略问题
- `JWT expired` - 认证过期
- `403 Forbidden` - 权限不足

---

### 3. 文件路径问题

检查上传 API 中的文件路径格式。

**当前代码**（`app/api/books/upload/route.ts:54`）：
```javascript
const fileName = `${user.id}/${Date.now()}_${file.name}`
```

这会创建路径如：`12345678-abcd-efgh/1234567890_book.pdf`

**确认**：
- `user.id` 是有效的 UUID
- 文件名没有特殊字符

---

## 🔍 诊断步骤

### 步骤 1：检查浏览器控制台

1. 打开网站 https://ai-audio-reader.vercel.app
2. 按 F12 打开开发者工具
3. 切换到 **Console** 标签
4. 尝试上传文件
5. 复制完整错误信息

### 步骤 2：检查 Vercel 部署日志

1. 打开 https://vercel.com/dashboard
2. 选择项目
3. 进入 **Deployments**
4. 点击最新部署
5. 查看 **Function Logs**
6. 找到上传请求的日志

**查找日志关键词**：
```
[Upload] Processing file:
[Upload] Storage error:
```

### 步骤 3：本地测试

本地是否能正常上传？

```bash
cd D:\Users\Administrator\Desktop\ai-audio-reader
npm run dev
```

访问 http://localhost:3000 测试上传。

- ✅ **本地成功，线上失败** → 环境变量问题
- ❌ **本地也失败** → 代码问题

---

## 🛠️ 修复方案

### 方案 A：配置 Vercel 环境变量

1. 进入 Vercel Dashboard → Settings → Environment Variables
2. 添加以下变量：

```bash
# 从本地 .env.local 复制这些值
NEXT_PUBLIC_SUPABASE_URL=https://genswexfryunruwbbqea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ZfmkXMTuDZejEIfg5xlUdQ_B8ost_b3
SUPABASE_SERVICE_ROLE_KEY=sb_secret_hc2Jy8ItLxzm4JliJv1kZA_s40qqI6k
OPENAI_API_KEY=你的OpenAI密钥
OPENAI_BASE_URL=你的OpenAI地址
```

3. **重要**：选择 Production, Preview, Development 三个环境
4. 点击 **Save**
5. 触发重新部署（可以 dummy commit 或手动点 Redeploy）

### 方案 B：简化上传逻辑（如果 A 不行）

如果环境变量都正确，可能是文件路径问题。我可以修改代码使用更简单的路径。

### 方案 C：使用客户端直接上传

最后的备选方案：让客户端直接上传到 Supabase，而不是通过服务器。

---

## 📊 快速检查清单

在告诉我具体错误之前，请检查：

- [ ] Vercel 环境变量已配置
- [ ] Supabase books 存储桶存在且为 Public
- [ ] RLS 策略已执行（迁移 2）
- [ ] 本地 `npm run dev` 能否正常上传
- [ ] 浏览器控制台的完整错误信息

---

## 🆘 需要提供的信息

请提供以下信息，我可以更精确地诊断：

1. **浏览器控制台错误**（F12 → Console）
2. **网络请求详情**（F12 → Network → 失败的请求 → Preview/Response）
3. **本地测试结果**（本地能否上传成功）
4. **Vercel 环境变量截图**（Settings → Environment Variables）

---

## 临时解决方案：本地测试

如果线上一直有问题，可以先在本地测试：

```bash
npm run dev
```

访问 http://localhost:3000 完成测试，确认功能正常后再排查 Vercel 部署问题。
