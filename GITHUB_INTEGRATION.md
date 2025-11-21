# 🔄 GitHub + Vercel 自动部署设置

## 为什么需要 GitHub？

使用 GitHub + Vercel 集成后：
- ✅ 每次 `git push` 自动部署（无需手动运行 vercel 命令）
- ✅ 更快的构建速度（Vercel 会缓存）
- ✅ 版本管理和回滚
- ✅ 团队协作

---

## 🚀 设置步骤（5 分钟）

### 步骤 1：创建 GitHub 仓库

1. **访问** https://github.com/new
2. **填写信息**：
   - Repository name: `ai-audio-reader`
   - Description: `AI 驱动的多语言书籍朗读器`
   - Privacy:
     - ✅ **Private**（推荐）- 只有您能看到
     - 或 Public - 开源项目
3. **不要勾选** "Initialize this repository with a README"
4. **点击** "Create repository"

### 步骤 2：推送代码到 GitHub

复制 GitHub 显示的命令，或运行：

```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-audio-reader.git
git push -u origin main
```

**注意**：替换 `YOUR_USERNAME` 为您的 GitHub 用户名。

第一次推送可能需要登录 GitHub：
- 会弹出浏览器让您授权
- 或者输入 Personal Access Token

### 步骤 3：连接 Vercel 和 GitHub

1. **访问** https://vercel.com/dashboard
2. **找到** `ai-audio-reader` 项目
3. **点击** Settings → Git
4. **点击** "Connect Git Repository"
5. **选择** GitHub
6. **选择** `ai-audio-reader` 仓库
7. **点击** "Connect"

### 步骤 4：配置环境变量（如果还没配置）

在 Vercel Dashboard：
1. Settings → Environment Variables
2. 添加所有 5 个环境变量（从 `.env.local` 复制）
3. 确保勾选 Production, Preview, Development

### 步骤 5：首次部署

连接完成后，Vercel 会自动触发首次部署！

等待 2-3 分钟，访问：
```
https://ai-audio-reader-xxx.vercel.app
```

---

## 📝 日常更新流程

从此以后，每次更新只需 **3 个命令**：

```bash
cd "D:\Users\Administrator\Desktop\ai-audio-reader"

# 1. 修改代码后，提交
git add .
git commit -m "添加新功能"

# 2. 推送到 GitHub
git push

# 3. 等待 Vercel 自动部署（1-2 分钟）
# 不需要手动运行 vercel 命令！
```

Vercel 会：
1. 检测到 GitHub 有新提交
2. 自动拉取最新代码
3. 自动构建和部署
4. 发送部署完成通知（邮件）

---

## 🌿 分支预览（高级功能）

如果您想测试新功能，可以创建分支：

```bash
# 创建新分支测试新功能
git checkout -b feature/new-ui
# 修改代码...
git add .
git commit -m "测试新 UI"
git push origin feature/new-ui
```

Vercel 会自动创建预览 URL：
```
https://ai-audio-reader-git-feature-new-ui-xxx.vercel.app
```

测试完成后，合并到主分支：
```bash
git checkout main
git merge feature/new-ui
git push
```

主分支部署会自动更新到生产环境！

---

## 📊 部署状态查看

### 查看 Vercel Dashboard
- https://vercel.com/dashboard
- 选择项目 → Deployments
- 查看每次部署的状态、日志、预览

### 查看 GitHub Actions（如果启用）
- https://github.com/YOUR_USERNAME/ai-audio-reader/actions
- 查看 CI/CD 流程

---

## 🔄 版本回滚

如果新版本有问题：

1. **访问** Vercel Dashboard → Deployments
2. **找到** 上一个正常的版本
3. **点击** "..." → "Promote to Production"
4. **1 秒钟**回滚完成！

或者用 Git：
```bash
git revert HEAD  # 撤销最后一次提交
git push         # Vercel 自动部署旧版本
```

---

## 💡 提示

### 不要提交敏感信息
确保 `.env.local` 在 `.gitignore` 中（已经配置好了）

### 查看构建日志
如果部署失败，在 Vercel Dashboard → Deployments → 点击失败的部署 → 查看 Build Logs

### 加速构建
Vercel 会自动缓存 `node_modules`，第 2 次开始构建只需 1-2 分钟

---

## ❓ 常见问题

### Q: 推送到 GitHub 后多久会部署？
A: 通常 10-30 秒内 Vercel 就会开始构建，总共 1-3 分钟完成。

### Q: 可以禁用自动部署吗？
A: 可以，在 Vercel Settings → Git → 关闭 "Auto-deploy"

### Q: 如何查看部署通知？
A: Vercel 会发邮件，也可以在 Dashboard 查看

### Q: GitHub 私有仓库收费吗？
A: 个人账号的私有仓库完全免费！

---

## 🎉 完成！

设置完成后，您的工作流程变成：

```
修改代码 → git add . → git commit -m "..." → git push → 喝杯茶 ☕ → 部署完成！
```

**再也不用手动运行 `vercel --prod` 了！** 🚀
