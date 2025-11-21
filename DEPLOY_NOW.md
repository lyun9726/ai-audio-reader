# 🚀 现在就部署！只需 5 分钟

您已经登录 Vercel 了！现在按照以下步骤完成部署：

## 📋 准备工作 - 复制环境变量

打开您的 `.env.local` 文件，复制以下内容（待会要用）：

```
NEXT_PUBLIC_SUPABASE_URL=https://genswexfryunruwbbqea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=（您的密钥）
SUPABASE_SERVICE_ROLE_KEY=（您的密钥）
OPENAI_API_KEY=sk-BK2yFPUzwdj2g1e08epkPs7K38XytIkEDoNhoPmtGr8dGuzS
OPENAI_BASE_URL=https://api.aicso.top/v1
```

## 步骤 1：打开 Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 您应该能看到项目：**ai-audio-reader**
3. 点击进入该项目

## 步骤 2：添加环境变量 ⭐ 重要！

1. 点击顶部的 **Settings** 标签
2. 点击左侧的 **Environment Variables**
3. 逐个添加以下 5 个变量：

### 变量 1: NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://genswexfryunruwbbqea.supabase.co`
- **Environments**: 勾选全部 3 个 (Production, Preview, Development)
- 点击 **Add**

### 变量 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: 从您的 `.env.local` 复制（很长的一串）
- **Environments**: 勾选全部 3 个
- 点击 **Add**

### 变量 3: SUPABASE_SERVICE_ROLE_KEY
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: 从您的 `.env.local` 复制（很长的一串）
- **Environments**: 勾选全部 3 个
- 点击 **Add**

### 变量 4: OPENAI_API_KEY
- **Key**: `OPENAI_API_KEY`
- **Value**: `sk-BK2yFPUzwdj2g1e08epkPs7K38XytIkEDoNhoPmtGr8dGuzS`
- **Environments**: 勾选全部 3 个
- 点击 **Add**

### 变量 5: OPENAI_BASE_URL
- **Key**: `OPENAI_BASE_URL`
- **Value**: `https://api.aicso.top/v1`
- **Environments**: 勾选全部 3 个
- 点击 **Add**

## 步骤 3：重新部署

回到终端，运行：

```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
vercel --prod
```

等待 1-2 分钟，看到 ✅ 就成功了！

会显示类似的URL：
```
https://ai-audio-reader-xxx.vercel.app
```

## 步骤 4：配置 Supabase 回调地址

1. 打开 Supabase Dashboard：https://supabase.com/dashboard
2. 选择您的项目
3. 点击左侧 **Authentication** → **URL Configuration**
4. 修改以下内容：

   **Site URL**:
   ```
   https://ai-audio-reader-xxx.vercel.app
   ```
   （替换成您的实际 URL）

   **Redirect URLs** (添加这两个):
   ```
   https://ai-audio-reader-xxx.vercel.app/auth/callback
   https://ai-audio-reader-xxx.vercel.app/dashboard
   ```

5. 点击 **Save**

## 步骤 5：测试！🎉

1. 打开您的 Vercel URL：`https://ai-audio-reader-xxx.vercel.app`
2. 注册一个新账号（用测试邮箱）
3. 上传一本书
4. 点击播放测试

## 分享给朋友

直接把 URL 发给朋友：
```
https://ai-audio-reader-xxx.vercel.app
```

他们可以：
- ✅ 注册自己的账号
- ✅ 上传自己的书籍
- ✅ 独立使用，互不干扰

---

## 💡 提示

### 每次更新代码后
```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
git add .
git commit -m "更新功能"
vercel --prod
```

### 查看部署日志
访问：https://vercel.com/dashboard → 选择项目 → Deployments

### 自定义域名
在 Vercel Dashboard → Settings → Domains 添加您自己的域名

---

## ❓ 遇到问题？

### 部署成功但打不开？
- 检查 Supabase URL Configuration 是否配置正确

### 无法登录？
- 检查环境变量是否都添加了
- 确认勾选了所有 3 个环境（Production, Preview, Development）

### 上传文件失败？
- 检查 SUPABASE_SERVICE_ROLE_KEY 是否正确
- 检查 Supabase Storage 的 audio 桶是否存在且为公开

---

## 🎯 现在开始吧！

1. 打开 https://vercel.com/dashboard
2. 添加 5 个环境变量
3. 运行 `vercel --prod`
4. 配置 Supabase 回调地址
5. 分享给朋友！

**需要帮助随时叫我！** 😊
