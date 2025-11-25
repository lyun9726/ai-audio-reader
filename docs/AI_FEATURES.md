# AI Features Documentation

## Overview

This document describes the AI-powered features of the AI Audio Reader, including Summary, Q&A, Mindmap, and Explain functionalities.

## Architecture

### Backend (Edge Runtime)

All AI APIs run on Edge Runtime for optimal performance and streaming support.

**Location:** `app/api/ai/*`

- `/api/ai/summary` - Generate article summaries
- `/api/ai/qa` - Interactive Q&A with streaming
- `/api/ai/mindmap` - Create hierarchical mind maps
- `/api/ai/explain` - Explain selected text with streaming

### Frontend

**Hooks:** `app/reader/hooks/useAI.ts`
**Components:** `app/reader/ai/*`
**Types:** `lib/ai/types.ts`
**Utils:** `lib/ai/utils.ts`

## Features

### 1. AI Summary

**Endpoint:** `POST /api/ai/summary`

**Request:**
```json
{
  "blocks": ReaderBlock[]
}
```

**Response:**
```json
{
  "summary": "Main summary text",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "mainIdea": "Central theme"
}
```

**Features:**
- Extracts key points from article
- Provides main idea
- Works with OpenAI or Claude
- Demo mode without API keys

**Usage:**
```typescript
const { summary, generateSummary, isLoading } = useAI()
await generateSummary(blocks)
```

### 2. AI Q&A (Question & Answer)

**Endpoint:** `POST /api/ai/qa`

**Request:**
```json
{
  "blocks": ReaderBlock[],
  "question": "What is the main topic?"
}
```

**Response:** Streaming text (SSE)

**Features:**
- Multi-turn conversation support
- Real-time streaming responses
- Context-aware answers based on article content
- Conversation history tracking

**Usage:**
```typescript
const { qaMessages, streamingAnswer, askQuestion, isStreaming } = useAI()
await askQuestion(blocks, "What is this about?")
```

**UI Components:**
- `AskBookPanel.tsx` - Full Q&A interface
- Shows conversation history
- Real-time streaming with cursor animation

### 3. AI Mindmap

**Endpoint:** `POST /api/ai/mindmap`

**Request:**
```json
{
  "blocks": ReaderBlock[]
}
```

**Response:**
```json
{
  "title": "Article Title",
  "nodes": [
    {
      "title": "Main Topic",
      "children": [
        { "title": "Subtopic 1" },
        { "title": "Subtopic 2" }
      ]
    }
  ]
}
```

**Features:**
- Hierarchical structure generation
- Automatic layout calculation
- Visual node and relation rendering
- SVG-based display

**Usage:**
```typescript
const { mindmap, generateMindmap, isLoading } = useAI()
await generateMindmap(blocks)
```

**UI Components:**
- `MindMapPanel.tsx` - Main visualization
- `Node.tsx` - Individual node rendering
- `Relation.tsx` - Connection lines

### 4. AI Explain

**Endpoint:** `POST /api/ai/explain`

**Request:**
```json
{
  "blocks": ReaderBlock[],
  "userSelection": "selected text to explain"
}
```

**Response:** Streaming text (SSE)

**Features:**
- Explains selected text in detail
- Provides examples and related concepts
- Real-time streaming
- Context-aware from full article

**Usage:**
```typescript
const { explanation, explainText, isStreaming } = useAI()
await explainText(blocks, selectedText)
```

**UI Components:**
- `ExplainPanel.tsx` - Full explain interface
- Selection capture button
- Streaming explanation display

## AI Providers

### Supported Providers

1. **OpenAI** (Primary)
   - Model: `gpt-4o-mini`
   - Streaming: ✅
   - JSON mode: ✅

2. **Claude** (Fallback)
   - Model: `claude-3-haiku-20240307`
   - Streaming: ✅
   - JSON mode: ✅

### Configuration

Add to `.env`:

```env
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-...
```

### Demo Mode

Without API keys, all features work in demo mode:
- Summary: Returns mock summary with key points
- Q&A: Streams demo response
- Mindmap: Returns demo hierarchical structure
- Explain: Streams demo explanation

## Streaming Implementation

### Server-Side (Edge Runtime)

```typescript
// OpenAI streaming
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [...],
    stream: true,
  }),
})

// Transform SSE to plain text stream
const stream = new ReadableStream({
  async start(controller) {
    const reader = response.body?.getReader()
    // ... decode and forward chunks
  },
})

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
})
```

### Client-Side

```typescript
const response = await fetch('/api/ai/qa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ blocks, question }),
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()
let fullAnswer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value, { stream: true })
  fullAnswer += chunk
  setStreamingAnswer(fullAnswer)
}
```

## State Management

### useAI Hook

**Location:** `app/reader/hooks/useAI.ts`

**Exports:**

```typescript
{
  // Global state
  isLoading: boolean
  isStreaming: boolean
  error: string | null

  // Summary
  summary: SummaryResponse | null
  generateSummary: (blocks) => Promise<Result>

  // Q&A
  qaMessages: QAMessage[]
  streamingAnswer: string
  askQuestion: (blocks, question) => Promise<Result>
  clearQA: () => void

  // Mindmap
  mindmap: MindmapResponse | null
  generateMindmap: (blocks) => Promise<Result>

  // Explain
  explanation: string
  explainText: (blocks, selection) => Promise<Result>
  clearExplanation: () => void
}
```

## UI Integration

### AISidebar Component

**Location:** `app/reader/ai/AISidebar.tsx`

Main container with tabs:
- Summary tab
- Q&A tab
- Mindmap tab
- Explain tab

### Integration with Reader

```typescript
import { useReaderStore } from '../stores/readerStore'
import { useAI } from '../hooks/useAI'

// Get blocks from reader
const blocks = useReaderStore(state => state.blocks)

// Use AI features
const { generateSummary } = useAI()
await generateSummary(blocks)
```

## Error Handling

All AI operations return:

```typescript
{
  success: boolean
  data?: T
  error?: string
}
```

Errors are:
1. Caught in hook
2. Stored in `error` state
3. Displayed in UI with error card

## Performance Considerations

### Text Truncation

```typescript
// Truncate to ~4000 tokens (16000 chars)
const truncatedText = truncateText(text, 4000)
```

### Edge Runtime

All APIs use Edge Runtime for:
- Fast cold starts
- Global deployment
- Streaming support
- Lower latency

### Caching

Future enhancement: Cache AI responses by content hash to reduce API calls.

## Testing

### Demo Mode Testing

1. Don't set API keys
2. All features work with mock data
3. Streaming simulated with intervals

### Real API Testing

1. Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
2. Test each feature:
   - Load article with blocks
   - Generate summary
   - Ask questions
   - Create mindmap
   - Explain text

## Future Enhancements

1. **Caching:**
   - Redis cache for AI responses
   - Content-based cache keys

2. **Advanced Features:**
   - Multi-language support
   - Custom prompt templates
   - User-configurable AI models

3. **Performance:**
   - Response compression
   - Incremental rendering
   - Background generation

4. **Analytics:**
   - Track usage metrics
   - Monitor API costs
   - User engagement tracking

## Type Definitions

**Location:** `lib/ai/types.ts`

```typescript
interface AIRequest {
  bookId?: string
  blocks: ReaderBlock[]
  userSelection?: string
  question?: string
  context?: string
}

interface SummaryResponse {
  summary: string
  keyPoints: string[]
  mainIdea: string
}

interface QAMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface MindmapNode {
  title: string
  children?: MindmapNode[]
}

interface MindmapResponse {
  title: string
  nodes: MindmapNode[]
}

interface ExplainResponse {
  explanation: string
  examples?: string[]
  relatedConcepts?: string[]
}
```

## Utility Functions

**Location:** `lib/ai/utils.ts`

```typescript
// Extract text from blocks
extractTextFromBlocks(blocks: ReaderBlock[]): string

// Truncate to max tokens
truncateText(text: string, maxTokens: number): string

// Create streaming response
createStreamResponse(stream: ReadableStream): Response
```

## Git Commit

**Commit:** `0bad12b`
**Message:** "feat: Add complete AI features with streaming support"

**Files Created:**
- `lib/ai/types.ts`
- `lib/ai/utils.ts`
- `app/api/ai/summary/route.ts`
- `app/api/ai/qa/route.ts`
- `app/api/ai/mindmap/route.ts`
- `app/api/ai/explain/route.ts`
- `app/reader/hooks/useAI.ts`
- `app/reader/ai/AISidebar.tsx`
- `app/reader/ai/explain/ExplainPanel.tsx`

**Files Updated:**
- `app/reader/ai/askbook/AskBookPanel.tsx`
- `app/reader/ai/mindmap/MindMapPanel.tsx`
