# 🚀 Quick Start Guide - AI Audio Reader

快速开始使用 AI Audio Reader 将 PDF/EPUB 转换为有声书。

## 📋 准备工作 (5分钟)

### 1. 创建 Supabase 项目

1. 访问 https://supabase.com 并注册/登录
2. 点击 "New Project"
3. 填写项目信息:
   - Name: `ai-audio-reader`
   - Database Password: (设置一个强密码)
   - Region: 选择离你最近的区域
4. 点击 "Create new project" 并等待初始化完成 (~2分钟)

### 2. 获取 Supabase 凭证

项目创建完成后:
1. 进入 **Settings** → **API**
2. 复制以下信息:
   - `Project URL` (类似: `https://xxxxx.supabase.co`)
   - `anon/public key`
   - `service_role key` (点击眼睛图标显示)

### 3. 设置数据库

1. 点击左侧 **SQL Editor**
2. 点击 "New query"
3. 打开项目中的 `supabase/migrations/20250119000000_initial_schema.sql`
4. 复制全部内容粘贴到 Supabase SQL Editor
5. 点击 **Run** 执行

### 4. 创建存储桶

1. 点击左侧 **Storage**
2. 点击 "New bucket"
3. Name: `audio`
4. **勾选** "Public bucket"
5. 点击 "Create bucket"

### 5. 获取 OpenAI API Key

1. 访问 https://platform.openai.com/api-keys
2. 登录/注册 OpenAI 账号
3. 点击 "Create new secret key"
4. 复制并保存 key (格式: `sk-...`)
5. 充值至少 $5 到账户

## 💻 本地运行 (5分钟)

### 1. 配置环境变量

在项目根目录创建 `.env.local` 文件:

```bash
cp .env.example .env.local
```

编辑 `.env.local`,填入你的凭证:

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
SUPABASE_SERVICE_ROLE_KEY=你的service-role-key
OPENAI_API_KEY=sk-你的openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 安装依赖并启动

```bash
npm install
npm run dev
```

打开浏览器访问: http://localhost:3000

## 🎉 开始使用

### 第一步: 注册账号

1. 访问 http://localhost:3000
2. 点击 "Sign up"
3. 输入邮箱和密码 (至少6位)
4. 点击 "Sign Up"

### 第二步: 上传你的第一本书

1. 登录后点击 "Upload Book"
2. 选择一个 PDF 或 EPUB 文件 (建议先用小文件测试)
3. 填写:
   - Book Title: 书名
   - Author: 作者 (可选)
   - Original Language: 选择原文语言
   - Translate To: 选择目标语言
4. 点击 "Upload and Process"
5. 等待处理完成 (~30秒 - 2分钟)

### 第三步: 翻译书籍

**方法 1: 使用 curl (推荐用于测试)**

```bash
# 获取 book ID (在浏览器URL或者network请求中查看)
BOOK_ID="你的书籍ID"

# 翻译
curl -X POST "http://localhost:3000/api/books/$BOOK_ID/translate" \
  -H "Cookie: $(cat ~/cookies.txt)"  # 需要先保存cookie
```

**方法 2: 在 Dashboard 添加翻译按钮 (开发中)**

未来版本会在 UI 直接添加"翻译"和"生成音频"按钮。

### 第四步: 生成语音

```bash
curl -X POST "http://localhost:3000/api/books/$BOOK_ID/tts" \
  -H "Cookie: $(cat ~/cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{"voice":"nova","speed":1.0}'
```

可选的 voice 选项:
- `alloy` - 中性, 清晰
- `echo` - 男性
- `fable` - 英式口音
- `onyx` - 深沉男性
- `nova` - 女性 (推荐中文)
- `shimmer` - 柔和女性

### 第五步: 开始阅读

1. 返回 Dashboard
2. 点击你的书籍
3. 进入阅读器界面
4. 功能说明:
   - **切换视图**: 点击右上角 "Translated/Original/Dual"
   - **播放音频**: 点击底部播放按钮
   - **调整速度**: 选择 0.75x - 2.0x
   - **跳转段落**: 使用前进/后退按钮
   - **自动滚动**: 播放时自动高亮当前段落

## 🎯 测试建议

建议使用以下方式测试:

1. **小文件测试** (首次):
   - 使用 5-10 页的 PDF
   - 检查上传、翻译、TTS 是否正常

2. **完整书籍** (确认无误后):
   - 上传完整书籍
   - 预计时间:
     - 上传: 1-2 分钟
     - 翻译: 2-5 分钟 (100页)
     - TTS: 5-15 分钟 (100页)

## ❗ 常见问题

### 1. 上传失败
**原因**: 文件太大或非文本PDF
**解决**:
- 确保文件 < 50MB
- 使用包含实际文本的PDF (非扫描件)

### 2. 翻译一直转圈
**原因**: OpenAI API 速率限制
**解决**:
- 检查 OpenAI 账户余额
- 检查控制台错误信息
- 确认 API Key 正确

### 3. 音频无法播放
**原因**: Storage bucket 未设置为 public
**解决**:
- 进入 Supabase Storage
- 确认 `audio` bucket 是 Public
- 刷新页面重试

### 4. 登录后白屏
**原因**: 环境变量配置错误
**解决**:
- 检查 `.env.local` 所有变量是否正确
- 重启开发服务器 `npm run dev`

## 📊 费用监控

### OpenAI 费用查看
1. 访问 https://platform.openai.com/usage
2. 查看每日使用情况

### 预期成本 (每本书)
- 短篇 (10k 字): ~$0.20
- 中篇 (50k 字): ~$1.00
- 长篇 (100k 字): ~$2.00

## 🚀 下一步

完成基础测试后,可以:

1. **部署到 Vercel** - 参考 README.md 的部署章节
2. **添加更多功能** - 查看 TODO 列表
3. **自定义UI** - 修改 Tailwind 样式
4. **集成支付** - 接入 Stripe 订阅

---

需要帮助? 查看 README.md 或提交 Issue 到 GitHub
