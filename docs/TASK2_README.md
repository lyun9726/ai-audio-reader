# Task 2: Reader Core Logic Binding

## Overview

This document describes the implementation of the reader core logic for the AI Audio Reader project.

## Architecture

### Backend Components

#### 1. Core Types (`lib/types.ts`)
- `ReaderBlock`: Basic text block with id, order, and text
- `ParseResult`: Result from parsing operations
- `Book`: Book entity with metadata and blocks

#### 2. ReaderEngine (`lib/reader/ReaderEngine.ts`)
- Main parsing engine
- Uses adapter pattern for different sources
- Implements Readability algorithm for HTML extraction
- SSRF protection built-in

#### 3. Adapters (`lib/reader/adapters/`)
- `ReaderAdapterStub.ts`: Returns demo data for `/mnt/data/5321c35c-86d2-43e9-b68d-8963068f3405.png`
- Extensible for future file type adapters (PDF, EPUB, etc.)

#### 4. Storage (`lib/storage/inMemoryDB.ts`)
- In-memory storage for books and blocks
- Ready to swap with real database (PostgreSQL, MongoDB, etc.)

#### 5. Cache (`lib/cache/simpleCache.ts`)
- Simple Map-based cache for translations
- Reduces redundant API calls

#### 6. TTS Provider (`lib/tts/provider.ts`)
- Returns demo audio in development
- Ready to integrate with OpenAI TTS API

### API Endpoints

#### POST `/api/ingest/url`
**Request:**
```json
{
  "url": "https://example.com/article",
  "previewOnly": true,
  "previewTranslated": false
}
```

**Response:**
```json
{
  "title": "Article Title",
  "blocks": [...],
  "isPreview": true
}
```

**Features:**
- SSRF protection (blocks localhost, 10.*, 192.168.*, etc.)
- Demo path support
- Preview mode (first 5 blocks only)
- 10s timeout

#### POST `/api/reader/parse`
**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "bookId": "book-1234567890",
  "title": "Article Title",
  "blocksCount": 42
}
```

**Features:**
- Saves to inMemoryDB
- Generates unique bookId
- Demo path returns "demo-book-1"

#### POST `/api/translate/batch`
**Request:**
```json
{
  "items": [
    { "id": "block-1", "text": "Hello world" }
  ],
  "targetLanguage": "zh"
}
```

**Response:**
```json
{
  "results": [
    { "id": "block-1", "original": "Hello world", "translation": "你好世界" }
  ]
}
```

**Features:**
- Cache-first lookup
- Batch processing
- Demo mode appends " (ZH DEMO)"
- Falls back to Claude/OpenAI if available

#### POST `/api/tts/synthesize`
**Request:**
```json
{
  "text": "Hello world",
  "voiceId": "alloy",
  "rate": 1.0,
  "pitch": 1.0
}
```

**Response (Demo mode):**
```json
{
  "audioUrl": "data:audio/mpeg;base64,...",
  "metadata": {
    "rate": 1.0,
    "pitch": 1.0,
    "voiceId": "alloy"
  }
}
```

**Response (Production):**
Binary audio stream (audio/mpeg)

### Client State (Zustand)

#### `app/reader/stores/readerStore.ts`

**State:**
- `bookId`, `title`, `blocks`, `currentBlockIndex`
- `viewMode`: 'scroll' | 'paginated'
- `tts`: { isPlaying, rate, pitch, voiceId, currentAudio }
- `translation`: { enabled, targetLanguage, translatedBlocks }

**Actions:**
- `setBook()`: Load book with blocks
- `play()`, `pause()`, `stop()`: TTS control
- `setRate()`, `setPitch()`: Audio settings
- `translateBlock()`, `translateAllBlocks()`: Translation

### Client Hooks

#### `useReaderActions()`
- `loadPreview(url)`: Load preview of URL
- `importBook(url)`: Import full book
- `setBlocks()`, `setCurrentBlockIndex()`, `setViewMode()`

#### `useTTS()`
- Exposes TTS state and controls
- `play()`, `pause()`, `stop()`
- `setRate()`, `setPitch()`, `setVoiceId()`

## Demo Mode

### Demo Path
When URL contains `/mnt/data/5321c35c-86d2-43e9-b68d-8963068f3405.png` or `/mnt/data/`:
- Returns hardcoded Bitcoin article (5 blocks)
- Creates bookId: "demo-book-1"
- Works without external API calls

### Translation Demo
Without API keys:
- Appends " (ZH DEMO)" to original text
- Still caches results

### TTS Demo
Without OpenAI API key:
- Returns base64 data URL (minimal silent audio)
- Allows testing playback logic

## Swapping to Production

### 1. Database
Replace `lib/storage/inMemoryDB.ts`:
```typescript
// Use Prisma, Drizzle, or direct SQL
export const db = {
  saveBook: async (book) => { /* INSERT */ },
  getBook: async (bookId) => { /* SELECT */ },
  // ...
}
```

### 2. Translation
Add API keys to `.env`:
```
ANTHROPIC_API_KEY=sk-...
# or
OPENAI_API_KEY=sk-...
```

Existing code in `/api/translate/batch` will auto-detect and use them.

### 3. TTS
Add to `.env`:
```
OPENAI_API_KEY=sk-...
```

Existing code in `/api/tts/synthesize` will auto-detect and call OpenAI TTS.

### 4. Advanced Parsing
Replace `ReaderAdapterStub` with real adapters:
- PDF: use `pdf-parse` or `pdfjs-dist`
- EPUB: use `epub` or `epubjs`
- DOCX: use `mammoth`

## Security

### SSRF Protection
`/api/ingest/url` blocks:
- `localhost`, `127.0.0.1`, `::1`
- `10.*.*.*`
- `192.168.*.*`
- `172.16-31.*.*`
- `169.254.*.*`

### Timeout
All fetch operations have 10s timeout to prevent hanging.

## Component Bindings

All UI components now connect to `readerStore`:
- `LinkReaderPanel`: Uses `/api/ingest/url` and `/api/reader/parse`
- `ScrollReading`: Reads blocks from store, displays translations
- `PlayButton`, `SpeedControl`, `PitchControl`: Use TTS actions
- `TranslationToggle`: Controls translation.enabled

## Testing

1. Test demo mode:
   ```
   POST /api/ingest/url
   { "url": "/mnt/data/5321c35c-86d2-43e9-b68d-8963068f3405.png" }
   ```

2. Test real URL:
   ```
   POST /api/ingest/url
   { "url": "https://example.com" }
   ```

3. Test translation cache:
   - Call `/api/translate/batch` twice with same text
   - Second call should be instant (cache hit)

4. Test TTS:
   - Click play button
   - Audio should play (demo mode or real)
   - Speed/pitch controls should work

## Future Enhancements

- Persistent database (PostgreSQL/MongoDB)
- Redis cache for translations
- Real TTS with OpenAI
- PDF/EPUB support
- User authentication
- Cloud storage for audio files
- Streaming TTS for long texts
