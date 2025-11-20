# 翻译功能使用指南

## ✅ API 配置已完成

你已经成功配置了 ChatAnywhere API:
- API Key: sk-uH2Z8hL... (已设置)
- Base URL: https://api.chatanywhere.tech/v1
- 测试结果: ✅ 连接成功

## 速率限制说明

ChatAnywhere 免费版有速率限制:
- **每分钟请求数限制**: 约 3-5 个请求
- **每天请求数限制**: 具体看你的套餐

为了避免速率限制,系统已优化:
- ✅ 顺序处理 (一次一个段落)
- ✅ 每个请求间隔 1.5 秒
- ✅ 自动重试机制 (最多3次)
- ✅ 遇到限制会等待 10 秒后重试

## 翻译速度估算

假设你的书有 **166 个段落**:

```
总时间 = 166 段落 × 1.5秒/段落 ≈ 4-5 分钟
```

如果遇到速率限制:
```
最长时间 ≈ 10-15 分钟 (包含重试等待)
```

## 使用步骤

1. **确保开发服务器正在运行**:
   ```bash
   npm run dev
   ```

2. **打开浏览器**:
   - 访问 http://localhost:3000
   - 进入 Dashboard

3. **点击 Translate 按钮**:
   - 系统会开始翻译
   - 书籍状态会变为 `translating`

4. **监控进度** (在终端查看日志):
   ```
   [Translator] Starting batch translation of 166 paragraphs...
   [Translator] Processing sequentially to respect rate limits
   [Translator] Translating paragraph 1/166...
   [Translator] Translation successful, tokens used: 123
   [Translator] Translating paragraph 2/166...
   ...
   ```

5. **完成后**:
   - 书籍状态变为 `ready`
   - 可以点击 **Audio** 按钮生成音频
   - 或直接进入 Reader 查看翻译

## 常见问题

### Q: 翻译太慢怎么办?

A: ChatAnywhere 免费版速率限制严格。选项:

1. **升级 ChatAnywhere 套餐** (推荐)
   - 访问 https://chatanywhere.tech
   - 查看付费套餐 (速度更快,无限制)

2. **分批翻译**
   - 一次翻译几十个段落
   - 等待几分钟后继续

3. **使用其他服务**
   - API2D (付费,速度快)
   - 自建代理 (需要技术)

### Q: 遇到 "Rate limit exceeded" 错误?

A: 等待几分钟后重试:

1. 检查 ChatAnywhere 配额
2. 等待 5-10 分钟
3. 重新点击 Translate 按钮

系统会自动从上次停止的地方继续翻译(只翻译未翻译的段落)。

### Q: 如何查看剩余配额?

A: 访问 ChatAnywhere 控制台:
- https://chatanywhere.tech/dashboard
- 查看你的 API 使用情况

### Q: 可以更换其他 API 吗?

A: 可以!编辑 `.env.local`:

**使用 API2D (付费,速度快)**:
```bash
OPENAI_API_KEY=你的API2D密钥
OPENAI_BASE_URL=https://openai.api2d.net/v1
```

**使用官方 API (需要VPN)**:
```bash
OPENAI_API_KEY=你的OpenAI密钥
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 性能优化建议

### 对于大文档 (500+ 段落):

1. **使用付费 API** - 速度快10倍以上
2. **分段上传** - 上传时就分成多个小书
3. **夜间翻译** - API 使用人少,速度更快

### 对于小文档 (< 100 段落):

当前配置已足够,耐心等待即可。

## 监控翻译进度

**在终端查看实时日志**:
```
[Translator] Translating paragraph 50/166...
[Translator] Translation successful, tokens used: 234
[Translator] Translating paragraph 51/166...
```

**在 Dashboard 查看状态**:
- `translating`: 正在翻译
- `ready`: 翻译完成
- `error`: 出错了

## 下一步

翻译完成后:
1. 点击 **Audio** 按钮生成音频
2. 进入 **Reader** 页面阅读/听书
3. 查看 **Summary** 生成摘要

---

**提示**: 第一次翻译可能会遇到速率限制,这是正常的。系统会自动重试,请耐心等待!
