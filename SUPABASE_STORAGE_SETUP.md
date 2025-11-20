# Supabase Storage 配置指南

## 必须配置:创建 Audio Bucket

在使用 TTS 功能之前,你**必须**在 Supabase 中创建存储桶 (Storage Bucket)。

### 步骤:

1. **打开 Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择你的项目: `genswexfryunruwbbqea`

2. **进入 Storage 页面**
   - 点击左侧菜单的 **Storage**
   - 点击 **New bucket** (新建存储桶)

3. **创建 audio bucket**
   - Bucket name: `audio`
   - Public bucket: ✅ **勾选** (必须是公开的,这样音频文件才能被访问)
   - 点击 **Create bucket**

4. **验证创建成功**
   - 你应该能在 Storage 页面看到 `audio` bucket
   - Bucket 的状态应该显示为 **Public**

### 为什么需要这个?

- TTS 功能会生成音频文件 (`.mp3`)
- 这些文件需要存储在 Supabase Storage 的 `audio` bucket 中
- Reader 页面会从这个 bucket 加载音频文件进行播放
- 如果不创建这个 bucket,TTS 生成会失败

### 完成后

配置完成后,你可以:

1. 回到 Dashboard 页面
2. 点击书籍下方的 **Translate** 按钮进行翻译
3. 翻译完成后,点击 **Audio** 按钮生成语音
4. 然后就可以在 Reader 页面播放音频了

---

## 常见问题

**Q: 翻译或音频生成失败怎么办?**

A: 检查以下几点:
1. `.env.local` 中的 OpenAI API Key 是否正确
2. OpenAI API 是否有足够的额度
3. 检查浏览器控制台 (F12) 的错误信息
4. 查看服务器日志 (终端中 `npm run dev` 的输出)

**Q: 音频文件能播放吗?**

A: 确保:
1. `audio` bucket 已创建
2. Bucket 设置为 **Public**
3. TTS 生成成功完成 (书籍状态变为 `ready`)

**Q: 翻译需要多久?**

A: 取决于书籍长度:
- 短文档 (几十段): 1-2 分钟
- 中等书籍 (几百段): 5-10 分钟
- 长篇书籍 (几千段): 可能需要 30 分钟以上

**Q: 可以同时翻译多本书吗?**

A: 可以,但建议一本一本来,避免 API 速率限制。
