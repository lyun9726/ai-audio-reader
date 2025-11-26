# Developer Quick Start Guide

**AI Audio Reader - UI Integration**

---

## 🚀 Get Started in 5 Minutes

### 1. Start the App

```bash
cd ai-audio-reader
npm install
npm run dev
```

Open: [http://localhost:3000/reader](http://localhost:3000/reader)

---

## 📖 Component Architecture

### Core Hook: `useReaderState`

```typescript
import { useReaderState } from '@/hooks/useReaderState'

function MyComponent() {
  const reader = useReaderState()

  // Load content
  reader.loadFromUrl('https://example.com/article')

  // Control playback
  reader.togglePlay()
  reader.setSpeed(1.5)

  // Translation
  reader.translateBlock('block-id')

  // Access state
  const { blocks, currentBlockIndex, isPlaying } = reader.state
}
```

---

## 🔌 API Endpoints

### Parse Content

```typescript
// URL
POST /api/parse
{ "url": "https://example.com/article" }

// File
POST /api/parse
Content-Type: multipart/form-data
FormData: { file: <binary> }

// Response
{
  "success": true,
  "blocks": [{ "id": "...", "type": "paragraph", "text": "..." }],
  "metadata": { "title": "...", "author": "..." }
}
```

### TTS

```typescript
POST /api/tts
{ "text": "Hello world", "voice": "default", "speed": 1.0 }

// Response
{ "success": true, "audioUrl": "https://..." }
```

### Translate

```typescript
POST /api/translate
{ "text": "Hello", "targetLang": "zh" }

// Response
{ "success": true, "translated": "【中文翻译】Hello..." }
```

### AI Summary

```typescript
POST /api/ai/deepsummary
{
  "bookId": "book-1",
  "blocks": [...],
  "level": "short"
}

// Response
{ "success": true, "summary": "..." }
```

### AI Q&A

```typescript
POST /api/ai/query-memory
{
  "userId": "user-1",
  "bookId": "book-1",
  "query": "What is the main theme?"
}

// Response
{ "success": true, "answer": "..." }
```

---

## 🎨 Component Usage

### ReaderContent

```typescript
import { ReaderContent } from '@/components/reader/ReaderContent'

<ReaderContent
  initialUrl="https://example.com/article"
  className="max-w-4xl mx-auto"
/>
```

### EnhancedBottomControlBar

```typescript
import { useReaderState } from '@/hooks/useReaderState'
import { EnhancedBottomControlBar } from '@/components/reader/EnhancedBottomControlBar'

function ReaderPage() {
  const readerState = useReaderState()

  return (
    <div>
      {/* Your content */}
      <EnhancedBottomControlBar readerState={readerState} />
    </div>
  )
}
```

### EnhancedRightSidePanel

```typescript
import { EnhancedRightSidePanel } from '@/components/reader/EnhancedRightSidePanel'

<EnhancedRightSidePanel
  readerState={readerState}
  onGenerateSummary={async () => {
    // Handle summary generation
  }}
  onAskQuestion={async (question) => {
    // Handle AI question
  }}
/>
```

---

## 🔧 Common Tasks

### Add New Block Type

```typescript
// 1. Update ReaderBlock interface in useReaderState.ts
export interface ReaderBlock {
  id: string
  type: 'paragraph' | 'image' | 'heading' | 'quote' // Add 'quote'
  text?: string
  // ...
}

// 2. Add rendering in ReaderBlock.tsx
if (block.type === 'quote') {
  return (
    <blockquote className="border-l-4 border-primary pl-4 italic">
      {block.text}
    </blockquote>
  )
}
```

### Add New Voice

```typescript
// In data/languages.ts
export const ttsPresets = [
  { id: 'default', name: 'Default Voice' },
  { id: 'alloy', name: 'Alloy' },
  { id: 'my-custom-voice', name: 'My Custom Voice' }, // Add here
]
```

### Add New Translation Language

```typescript
// In lib/translation/translator.ts
export type SupportedLanguage = 'zh' | 'en' | 'jp' | 'es' | 'fr' | 'de' // Add 'de'

// In data/languages.ts
export const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' }, // Add here
]
```

### Customize Layout

```typescript
// Change layout mode programmatically
reader.setLayoutMode('split') // 'single' | 'split' | 'overlay'

// Conditional rendering based on mode
{reader.state.layoutMode === 'split' && (
  <EnhancedRightSidePanel {...props} />
)}
```

---

## 🎯 State Management

### Reader State Structure

```typescript
{
  // Content
  blocks: ReaderBlock[]           // All content blocks
  currentBlockIndex: number       // Active block (0-based)
  totalBlocks: number            // Total count

  // Playback
  isPlaying: boolean             // TTS playing state
  speed: number                  // 0.5 - 3.0
  voice: string                  // Voice ID
  isSpeaking: boolean            // Currently speaking
  autoScroll: boolean            // Auto-scroll enabled

  // Translation
  translationEnabled: boolean    // Translation on/off
  targetLanguage: string         // 'zh' | 'en' | etc
  translations: Map<string, string> // blockId -> translated text
  isTranslating: boolean         // Translation in progress

  // Progress
  progress: number               // 0-100 percentage
  timeRemaining: string          // "5:30" format

  // UI
  layoutMode: 'single' | 'split' | 'overlay'
  isLoading: boolean            // Content loading
}
```

### Actions Available

```typescript
// Content
loadFromUrl(url: string) => Promise<void>
loadFromFile(file: File) => Promise<void>
loadBlocks(blocks: ReaderBlock[]) => void

// Navigation
goToBlock(index: number) => void
nextBlock() => void
prevBlock() => void

// Playback
togglePlay() => void
setSpeed(speed: number) => void
setVoice(voice: string) => void
playBlock(blockId: string) => void
stopPlayback() => void

// Translation
toggleTranslation() => void
setTargetLanguage(lang: string) => void
translateBlock(blockId: string) => Promise<void>
translateAllBlocks() => Promise<void>

// Layout
setLayoutMode(mode: 'single' | 'split' | 'overlay') => void

// Utility
reset() => void
```

---

## 🔍 Debugging

### Enable Detailed Logging

```typescript
// In useReaderState.ts
const loadFromUrl = async (url: string) => {
  console.log('[Reader] Loading URL:', url)
  // ...
  console.log('[Reader] Loaded blocks:', data.blocks.length)
}
```

### Check API Responses

```typescript
// In browser console
fetch('/api/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
})
.then(res => res.json())
.then(data => console.log(data))
```

### Inspect State

```typescript
// Add to component
useEffect(() => {
  console.log('[State]', reader.state)
}, [reader.state])
```

---

## 🧪 Testing

### Test Content Loading

```typescript
// Test URL
const testUrl = 'https://example.com/article'
await reader.loadFromUrl(testUrl)
expect(reader.state.blocks.length).toBeGreaterThan(0)

// Test file
const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
await reader.loadFromFile(file)
expect(reader.state.blocks.length).toBeGreaterThan(0)
```

### Test Playback

```typescript
// Load demo content first
reader.loadBlocks([
  { id: '1', type: 'paragraph', text: 'Test' }
])

// Start playback
reader.togglePlay()
expect(reader.state.isPlaying).toBe(true)

// Stop playback
reader.stopPlayback()
expect(reader.state.isPlaying).toBe(false)
```

### Test Translation

```typescript
// Enable translation
reader.toggleTranslation()
expect(reader.state.translationEnabled).toBe(true)

// Translate block
await reader.translateBlock('block-1')
expect(reader.state.translations.has('block-1')).toBe(true)
```

---

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

### Environment Variables

```env
# Required for production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional (enables real features, otherwise demo mode)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

---

## 💡 Tips & Tricks

### Performance

```typescript
// Lazy load heavy components
const EnhancedRightSidePanel = dynamic(
  () => import('@/components/reader/EnhancedRightSidePanel'),
  { ssr: false }
)
```

### Error Handling

```typescript
try {
  await reader.loadFromUrl(url)
} catch (error) {
  console.error('Failed to load:', error)
  // Show user-friendly message
}
```

### Keyboard Shortcuts

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ') reader.togglePlay()
    if (e.key === 'ArrowRight') reader.nextBlock()
    if (e.key === 'ArrowLeft') reader.prevBlock()
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [reader])
```

---

## 📚 Resources

- **Full Integration Docs:** `UI_INTEGRATION_COMPLETE.md`
- **Translation Docs:** `TASKS_7_8_COMPLETE.md`
- **AI Features Docs:** `TASK7_COMPLETE_SUMMARY.md`
- **Deployment Guide:** `docs/DEPLOYMENT.md`

---

## 🆘 Common Issues

### Issue: "No blocks loaded"
**Solution:** Check `/api/parse` response in Network tab

### Issue: "TTS not playing"
**Solution:** Check browser console for audio errors, verify `/api/tts` response

### Issue: "Translation not working"
**Solution:** Check if `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set, otherwise demo mode is active

### Issue: "Right panel not showing"
**Solution:** Check `layoutMode` is set to `'split'` or `'overlay'`

---

**Happy Coding! 🎉**
