# 🚀 部署指南 - 让朋友访问您的应用

## 方式 1：Vercel 部署（推荐，最简单）

### 步骤 1：登录 Vercel

打开终端，运行：

```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
vercel login
```

会弹出浏览器让您登录 Vercel：
- 如果没有账号，用 GitHub/GitLab/Email 注册（免费）
- 登录后回到终端

### 步骤 2：部署项目

```bash
vercel
```

按照提示操作：
1. **Set up and deploy?** → 选择 `Y`（是）
2. **Which scope?** → 选择您的账号
3. **Link to existing project?** → 选择 `N`（否，这是新项目）
4. **What's your project's name?** → 输入 `ai-audio-reader`（或您喜欢的名字）
5. **In which directory is your code located?** → 直接按回车（`.`）
6. **Want to override the settings?** → 选择 `N`（否）

等待 30-60 秒，部署完成！

### 步骤 3：配置环境变量

部署完成后会显示一个 URL，比如：`https://ai-audio-reader.vercel.app`

但现在还不能用，因为缺少环境变量。继续操作：

1. **打开 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 找到您的项目 `ai-audio-reader`
   - 点击进入

2. **添加环境变量**
   - 点击顶部 **Settings** 标签
   - 点击左侧 **Environment Variables**
   - 添加以下变量（从您的 `.env.local` 文件复制）：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://genswexfryunruwbbqea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的密钥
SUPABASE_SERVICE_ROLE_KEY=您的密钥

# OpenAI API（AICSO）
OPENAI_API_KEY=sk-BK2yFPUzwdj2g1e08epkPs7K38XytIkEDoNhoPmtGr8dGuzS
OPENAI_BASE_URL=https://api.aicso.top/v1
```

**重要**：
- 每个变量都要添加到 `Production`, `Preview`, `Development` 三个环境
- 点击 `Add` 按钮添加每个变量

3. **重新部署**

   回到终端，运行：
   ```bash
   vercel --prod
   ```

### 步骤 4：更新 Supabase 配置

您的应用现在有了一个公网地址，需要告诉 Supabase：

1. **打开 Supabase Dashboard**
   - https://supabase.com/dashboard
   - 选择您的项目
   - 点击左侧 **Authentication**
   - 点击 **URL Configuration**

2. **添加生产环境 URL**

   在 **Site URL** 中添加您的 Vercel URL：
   ```
   https://ai-audio-reader.vercel.app
   ```

3. **添加回调 URL**

   在 **Redirect URLs** 中添加：
   ```
   https://ai-audio-reader.vercel.app/auth/callback
   https://ai-audio-reader.vercel.app/dashboard
   ```

4. 点击 **Save** 保存

### 步骤 5：测试并分享！

1. **访问您的应用**
   - 打开：`https://ai-audio-reader.vercel.app`（替换成您的实际 URL）
   - 注册/登录
   - 上传一本书测试

2. **分享给朋友**
   - 复制 URL 发给朋友
   - 他们可以注册自己的账号
   - 每个人的数据是独立的（RLS 权限控制）

---

## 方式 2：GitHub + Vercel（自动化）

如果您想要更专业的方式，可以先推送到 GitHub：

### 步骤 1：创建 GitHub 仓库

1. 访问：https://github.com/new
2. Repository name: `ai-audio-reader`
3. Privacy: Private（私有）或 Public（公开）
4. 点击 **Create repository**

### 步骤 2：推送代码

```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-audio-reader.git
git push -u origin main
```

### 步骤 3：导入到 Vercel

1. 访问：https://vercel.com/new
2. 点击 **Import Git Repository**
3. 选择您的 GitHub 仓库
4. 添加环境变量（同上）
5. 点击 **Deploy**

---

## 🎯 快速命令

如果您已经配置好一切，每次更新代码后只需：

```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
git add .
git commit -m "Update features"
git push  # 如果用了 GitHub
vercel --prod  # 如果直接用 Vercel CLI
```

Vercel 会自动重新部署最新版本！

---

## 💰 费用说明

**Vercel 免费额度**（个人项目足够用）：
- ✅ 无限部署
- ✅ 100 GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN

**Supabase 免费额度**：
- ✅ 500 MB 数据库
- ✅ 1 GB 存储
- ✅ 2 GB 流量/月

**AICSO API**：
- 按使用量付费
- 翻译：约 ¥0.03/段
- TTS：约 ¥0.02/段
- 一本 180 段的书约 ¥9

---

## ❓ 常见问题

### Q: 朋友访问时报错 "Unable to connect"？
A: 检查 Supabase 的 URL Configuration 是否添加了 Vercel URL

### Q: 上传文件失败？
A: 检查 Vercel 环境变量是否正确配置

### Q: 每次部署都要等很久？
A: 使用 GitHub 集成，Vercel 会自动部署（更快）

### Q: 想要自己的域名（如 myreader.com）？
A: 在 Vercel Dashboard → Settings → Domains 添加自定义域名

---

## 🎉 完成！

现在您的朋友可以：
1. 访问您的应用 URL
2. 注册自己的账号
3. 上传并朗读自己的书籍
4. 所有数据独立且安全

**需要帮助？** 随时问我！😊
