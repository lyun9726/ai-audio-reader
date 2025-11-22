# TTS 成本优化方案

## 当前方案 (OpenAI TTS)

### 优点
- 高质量自然语音
- 支持多语言 (英语、中文、日语等)
- 6种声音选择
- 速度可调

### 成本
- `tts-1`: $0.015 / 1K characters (约 ¥0.11 / 1000字符)
- `tts-1-hd`: $0.030 / 1K characters (约 ¥0.22 / 1000字符)

**示例成本计算:**
- 一本 10万字 的书
- 使用 tts-1: $1.5 (约 ¥11)
- 使用 tts-1-hd: $3.0 (约 ¥22)

---

## 成本优化方案

### 方案 1: 使用免费/低成本 TTS 服务

#### 1.1 Google Cloud TTS
**成本**:
- 前 100万字符/月 免费
- 超出后 $4.00 / 1M characters (约 ¥29 / 100万字符)
- WaveNet voices: $16.00 / 1M characters

**优点**:
- 免费额度充足
- 支持多语言
- 多种声音选择
- 较高质量

**缺点**:
- 需要 Google Cloud 账号
- 配置相对复杂

**实现**:
```typescript
import textToSpeech from '@google-cloud/text-to-speech'

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})

const [response] = await client.synthesizeSpeech({
  input: { text: originalText },
  voice: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-F'
  },
  audioConfig: {
    audioEncoding: 'MP3',
    speakingRate: speed,
  }
})
```

#### 1.2 Azure Cognitive Services (Speech)
**成本**:
- 免费层: 5小时音频/月
- Pay-as-you-go: $1.00 / 1M characters (约 ¥7 / 100万字符)
- Neural voices: $16.00 / 1M characters

**优点**:
- 免费层充足
- 高质量 Neural voices
- 强大的中文支持
- 声音克隆功能 (Custom Neural Voice)

**缺点**:
- 需要 Azure 账号
- Neural voices 价格较高

#### 1.3 Amazon Polly
**成本**:
- 前 12个月: 500万字符/月 免费
- Standard voices: $4.00 / 1M characters
- Neural voices: $16.00 / 1M characters

**优点**:
- 首年免费额度大
- 支持 SSML (语音标记语言)
- 多种声音选择

### 方案 2: 开源 TTS 引擎 (完全免费)

#### 2.1 Coqui TTS (推荐)
**成本**: 完全免费

**优点**:
- 开源免费
- 支持多语言
- 可本地部署
- 支持声音克隆

**缺点**:
- 需要服务器资源
- 质量略低于商业服务
- 配置和维护成本

**实现**:
```bash
# 安装
pip install TTS

# 运行 TTS 服务器
tts-server --model_name tts_models/en/ljspeech/tacotron2-DDC
```

```typescript
// API 调用
const response = await fetch('http://localhost:5002/api/tts', {
  method: 'POST',
  body: JSON.stringify({
    text: originalText,
    speaker_id: 'p225',
    style_wav: '',
  })
})
```

#### 2.2 Mozilla TTS
**成本**: 完全免费

**优点**:
- 开源免费
- 高质量模型
- 活跃社区

**缺点**:
- 需要GPU加速
- 部署复杂

#### 2.3 Piper TTS
**成本**: 完全免费

**优点**:
- 轻量级
- 快速推理
- 支持树莓派等低功耗设备
- 多语言支持

**缺点**:
- 声音选择较少
- 质量中等

### 方案 3: 混合方案

#### 3.1 缓存优化
**实现音频缓存，避免重复生成**

```typescript
// 检查是否已有缓存
const { data: existingAudio } = await supabase
  .from('audio_cache')
  .select('audio_url, duration')
  .eq('book_id', bookId)
  .eq('para_idx', paraIdx)
  .eq('voice', voice)
  .eq('speed', speed)
  .single()

if (existingAudio) {
  return NextResponse.json(existingAudio)
}

// 否则生成新音频并缓存
```

**节省成本**: 50-80% (对于重复阅读的内容)

#### 3.2 按需生成 + 预加载
- 只为当前段落生成音频
- 预加载接下来 3-5 个段落
- 不生成用户未访问的段落

**节省成本**: 30-50%

#### 3.3 分层 TTS 策略
- 重要内容: OpenAI TTS (高质量)
- 预览/草稿: Google TTS 免费层
- 批量处理: Coqui TTS (本地部署)

### 方案 4: 声音克隆

#### 4.1 ElevenLabs
**成本**:
- Free tier: 10,000 characters/月
- Creator: $5/月 (30,000 characters)
- Pro: $22/月 (100,000 characters)

**优点**:
- 顶级声音克隆质量
- 可以克隆任何声音
- 情感表达丰富

**缺点**:
- 免费额度很小
- 相对昂贵

#### 4.2 PlayHT
**成本**:
- Free: 2,500 words/月
- Creator: $19/月 (30,000 words)
- Pro: $39/月 (100,000 words)

**优点**:
- 声音克隆
- 超逼真语音
- API 简单

#### 4.3 Coqui TTS (声音克隆 - 开源)
**成本**: 完全免费

**实现**:
```bash
# 使用 XTTS 模型进行声音克隆
tts --text "Text to speak" \
    --model_name "tts_models/multilingual/multi-dataset/xtts_v2" \
    --speaker_wav "/path/to/reference_audio.wav" \
    --language_idx "en" \
    --out_path "output.wav"
```

**优点**:
- 完全免费
- 只需 6-30秒参考音频
- 支持多语言

**缺点**:
- 需要 GPU
- 质量略低于商业服务

---

## 推荐实施方案

### 阶段 1: 立即优化 (保持 OpenAI)
1. **实施音频缓存**: 避免重复生成
2. **按需生成**: 只为用户访问的段落生成音频
3. **使用 tts-1**: 而非 tts-1-hd (质量差异不大，成本减半)

**预期节省**: 60-70%

### 阶段 2: 添加免费层 (1-2周)
1. **集成 Google Cloud TTS**: 使用免费额度
2. **用户选择**: 让用户选择 TTS 引擎
3. **自动降级**: OpenAI 配额用完后自动切换到 Google

**预期节省**: 80-90%

### 阶段 3: 本地部署 (1-2月)
1. **部署 Coqui TTS**: 用于批量处理
2. **混合方案**:
   - 实时阅读: OpenAI/Google
   - 整书转换: Coqui TTS
3. **声音克隆**: 提供个性化体验

**预期节省**: 95%+

---

## 代码实现示例

### 多引擎 TTS 管理器

```typescript
// lib/services/tts.ts

export type TTSEngine = 'openai' | 'google' | 'azure' | 'coqui'

interface TTSConfig {
  engine: TTSEngine
  voice: string
  speed: number
}

export class TTSManager {
  async generateAudio(
    text: string,
    config: TTSConfig
  ): Promise<{ audioUrl: string; duration: number }> {
    switch (config.engine) {
      case 'openai':
        return this.generateOpenAI(text, config)
      case 'google':
        return this.generateGoogle(text, config)
      case 'azure':
        return this.generateAzure(text, config)
      case 'coqui':
        return this.generateCoqui(text, config)
      default:
        throw new Error('Unknown TTS engine')
    }
  }

  private async generateOpenAI(text: string, config: TTSConfig) {
    // 现有实现
  }

  private async generateGoogle(text: string, config: TTSConfig) {
    const textToSpeech = await import('@google-cloud/text-to-speech')
    // ... Google TTS 实现
  }

  private async generateCoqui(text: string, config: TTSConfig) {
    const response = await fetch(process.env.COQUI_TTS_SERVER!, {
      method: 'POST',
      body: JSON.stringify({ text, speaker_id: config.voice })
    })
    // ... Coqui 实现
  }
}
```

### 用户设置 UI

```tsx
// Settings page
<select
  value={ttsEngine}
  onChange={(e) => setTtsEngine(e.target.value)}
>
  <option value="openai">OpenAI TTS (高质量, 付费)</option>
  <option value="google">Google TTS (免费额度)</option>
  <option value="azure">Azure TTS (中等成本)</option>
  <option value="coqui">Coqui TTS (完全免费, 需本地部署)</option>
</select>
```

---

## 总结

| 方案 | 月成本 (10本书) | 质量 | 实施难度 |
|------|----------------|------|---------|
| OpenAI TTS (当前) | ~$15-30 | ⭐⭐⭐⭐⭐ | ⭐ |
| OpenAI + 缓存优化 | ~$5-10 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Google TTS 免费层 | $0 (前100万字符) | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Azure 免费层 | $0 (前5小时) | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Coqui TTS (本地) | $0 (服务器成本另计) | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 混合方案 | ~$2-5 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**推荐**:
1. **短期**: OpenAI + 缓存优化
2. **中期**: 添加 Google/Azure 免费层作为备选
3. **长期**: 考虑本地部署 Coqui TTS 用于批量处理
