# 🔗 连接现有 Vercel 项目到 GitHub

## 当前状态

- ✅ Vercel 项目：`ai-audio-reader`（2小时前创建）
- ✅ GitHub 仓库：`lyun9726/ai-audio-reader`（刚推送）
- ❓ 它们还没连接

## 📝 连接步骤

### 步骤 1：打开 Vercel 项目设置

1. 访问：https://vercel.com/dashboard
2. 找到 `ai-audio-reader` 项目
3. 点击进入项目

### 步骤 2：连接 Git 仓库

1. **点击顶部 "Settings" 标签**
2. **点击左侧 "Git"**
3. **查看当前状态**：

   **情况 A：如果显示 "Not Connected"**
   - 点击 "Connect Git Repository"
   - 选择 "GitHub"
   - 授权 Vercel（如果需要）
   - 搜索并选择 `lyun9726/ai-audio-reader`
   - 点击 "Connect"
   - ✅ 连接成功！

   **情况 B：如果已经显示连接到其他仓库**
   - 点击 "Disconnect"
   - 然后按照情况 A 重新连接

### 步骤 3：添加环境变量

**重要！** 如果之前没添加过：

1. Settings → Environment Variables
2. 添加这 5 个变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://genswexfryunruwbbqea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<从 .env.local 复制>
SUPABASE_SERVICE_ROLE_KEY=<从 .env.local 复制>
OPENAI_API_KEY=sk-BK2yFPUzwdj2g1e08epkPs7K38XytIkEDoNhoPmtGr8dGuzS
OPENAI_BASE_URL=https://api.aicso.top/v1
```

每个变量都勾选：✅ Production ✅ Preview ✅ Development

### 步骤 4：触发首次部署

连接后，Vercel **不会自动部署**，需要手动触发：

**方式 A：重新部署最后一次提交**
1. 点击 "Deployments" 标签
2. 如果有部署记录，点击最新的
3. 点击 "Redeploy"

**方式 B：推送新提交（推荐）**
运行这个命令触发部署：

```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
git commit --allow-empty -m "🔗 Connect to Vercel"
git push
```

Vercel 会自动检测到新提交并开始部署！

### 步骤 5：查看部署进度

1. 在 Vercel Dashboard → Deployments
2. 应该看到新的部署正在运行
3. 点击查看详细日志
4. 等待 1-3 分钟

---

## ✅ 验证连接成功

连接成功的标志：

### 在 Vercel Dashboard
- Settings → Git 显示：
  ```
  Connected to GitHub: lyun9726/ai-audio-reader
  Production Branch: main
  ```

### 在 GitHub 仓库
- 访问：https://github.com/lyun9726/ai-audio-reader
- 可能会看到 Vercel 的 badge 或集成标识

### 测试自动部署
运行这个命令：
```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
echo "# Test" >> README.md
git add .
git commit -m "Test auto-deploy"
git push
```

然后：
1. 打开 Vercel Dashboard → Deployments
2. 应该在几秒内看到新的部署开始！
3. 这说明自动部署已启用 ✅

---

## 🎉 完成后的工作流

从此以后，每次更新：

```bash
# 1. 修改代码
# 2. 提交
git add .
git commit -m "添加新功能"

# 3. 推送
git push

# 4. Vercel 自动部署（无需手动操作！）
```

---

## 💡 常见问题

### Q: 连接后原来的部署会消失吗？
A: 不会！部署历史会保留。

### Q: 我可以断开连接吗？
A: 可以，在 Settings → Git 点击 "Disconnect"

### Q: 连接后 vercel CLI 还能用吗？
A: 可以，但不推荐。建议用 `git push` 自动部署。

### Q: 每个分支都会部署吗？
A: 是的！每个分支都有独立的预览 URL，只有 main 分支部署到生产环境。

---

## 🚀 开始连接吧！

现在去 Vercel Dashboard 完成连接：
1. Settings → Git → Connect
2. 选择 `lyun9726/ai-audio-reader`
3. 添加环境变量
4. `git push` 触发部署

需要帮助随时叫我！😊
