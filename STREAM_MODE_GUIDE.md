# 🚀 流式阅读模式 - 实时翻译+朗读

## 新增功能

已添加**流式处理模式**,让用户无需等待,立即开始阅读!

## 工作原理

### 传统模式 (之前):
```
点击 Translate → 等待5分钟翻译全部 → 点击 Audio → 等待3分钟生成音频 → 开始阅读
总等待时间: 8-10分钟 ❌
```

### 流式模式 (新):
```
点击"开始阅读" →
  ├─ 翻译第1段 (2秒)
  ├─ 生成音频 (1秒)
  └─ 立即播放! ✅

同时后台:
  ├─ 翻译第2-4段
  └─ 生成第2-4段音频

第1段播放完 → 无缝播放第2段 (已准备好)
```

**用户等待时间: 3-5秒开始!** ⚡

## 技术实现

### 1. 新增 API 端点

**`/api/books/[bookId]/stream-translate`** - 逐段翻译
- 输入: `{ paraIdx: 0 }`
- 输出: `{ translation: "..." }`
- 如果已翻译,立即返回缓存

**`/api/books/[bookId]/stream-tts`** - 逐段生成音频
- 输入: `{ paraIdx: 0, voice: "nova", speed: 1.0 }`
- 输出: `{ audioUrl: "...", duration: 123 }`
- 如果已生成,立即返回缓存

### 2. useStreamReader Hook

智能管理:
- ✅ 翻译缓存
- ✅ 音频缓存
- ✅ 预加载队列 (提前加载3段)
- ✅ 自动播放下一段

### 3. 优势

| 功能 | 传统模式 | 流式模式 |
|------|---------|---------|
| 首次等待 | 8-10分钟 | **3-5秒** |
| 中途切换 | 立即(已生成) | 立即(缓存) |
| 网络失败 | 全部重来 | 只重试当前段 |
| 成本 | 一次性全部 | 按需生成 |

## 如何使用

### 方式 1: 集成到现有 Reader

修改 `app/reader/[bookId]/page.tsx`:

```typescript
import { useStreamReader } from '@/lib/hooks/useStreamReader'

export default function ReaderPage() {
  const { bookId } = useParams()
  const [paragraphs, setParagraphs] = useState([])

  const {
    currentParaIdx,
    isPlaying,
    isTranslating,
    isGeneratingAudio,
    audioRef,
    startPlaying,
    stopPlaying,
    nextParagraph,
    previousParagraph,
  } = useStreamReader({
    bookId,
    paragraphs,
    voice: 'nova',
    speed: 1.0,
  })

  return (
    <div>
      {/* 播放控制 */}
      <button onClick={isPlaying ? stopPlaying : startPlaying}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* 状态显示 */}
      {isTranslating && <span>正在翻译...</span>}
      {isGeneratingAudio && <span>正在生成音频...</span>}

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} />
    </div>
  )
}
```

### 方式 2: 作为独立模式

在 Dashboard 添加新按钮:

```typescript
<button onClick={() => router.push(`/reader/${book.id}?mode=stream`)}>
  🚀 Stream Mode (即时播放)
</button>
```

## 用户体验对比

### 场景 1: 第一次打开书籍

**传统模式**:
1. 用户: "我想听这本书"
2. 系统: "请等待8分钟翻译和音频生成"
3. 用户: "太慢了,我不等了" ❌

**流式模式**:
1. 用户: "我想听这本书"
2. 系统: "正在准备第1段... (3秒)"
3. 系统: "开始播放!"
4. 用户: "太快了!" ✅

### 场景 2: 中途跳转

**传统模式**:
- 如果该段已生成: 立即播放 ✅
- 如果该段未生成: 无法播放 ❌

**流式模式**:
- 任何段落: 3-5秒准备,立即播放 ✅

## 实现建议

### Phase 1: 添加流式端点 (已完成)
- ✅ stream-translate API
- ✅ stream-tts API
- ✅ useStreamReader hook

### Phase 2: 修改 Reader 页面
1. 集成 useStreamReader
2. 添加加载状态UI
3. 测试用户体验

### Phase 3: 优化
1. 智能预加载 (根据阅读速度调整)
2. 断点续播 (保存进度)
3. 离线缓存 (Service Worker)

## 成本对比

### 传统模式:
```
翻译: 180段 × 100 tokens = 18,000 tokens
TTS: 180段 × 200字 = 36,000字
总成本: ~$5
一次性全部生成
```

### 流式模式:
```
只翻译用户听的段落
用户听了50段 → 成本 ~$1.5
用户听了全部 → 成本 ~$5 (相同)

优势: 用户可能不会听完全部,节省成本!
```

## 下一步

要启用流式模式吗?

**方案 A: 完全替换传统模式**
- 移除 Translate/Audio 按钮
- 只保留 "开始阅读" 按钮
- 自动流式处理

**方案 B: 两种模式共存**
- 保留批量生成 (适合WiFi环境,一次生成)
- 添加流式模式 (适合快速体验)
- 让用户选择

**方案 C: 智能切换**
- 如果已翻译 → 直接播放
- 如果未翻译 → 流式处理
- 用户无感知

我推荐**方案 C** - 智能切换,给用户最佳体验!

要现在实现吗?
