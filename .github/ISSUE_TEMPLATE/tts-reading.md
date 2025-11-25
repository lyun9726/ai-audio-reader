---
name: TTS Reading Engine
about: Text-to-Speech automatic reading with sentence highlighting
title: '[FEATURE] TTS Auto Reading - '
labels: enhancement, reader-experience, tts
assignees: ''
---

## Feature: TTS Reading Engine

### Description
Implement Text-to-Speech automatic reading with sentence-level highlighting, auto-progression through blocks, and playback controls.

### Implementation Checklist

#### Core Component
- [x] Create `app/reader/components/TTSPlayer.tsx`
- [x] Implement play/pause/stop controls
- [x] Implement sentence splitting
- [x] Implement current sentence tracking
- [x] Implement auto-advance to next block

#### Playback Features
- [x] Play current block
- [x] Pause speech
- [x] Resume from pause
- [x] Stop and reset
- [x] Auto-play next block on completion
- [ ] Skip to next/previous sentence
- [ ] Adjust speed (0.5x - 2.0x)
- [ ] Adjust pitch
- [ ] Voice selection

#### Highlighting
- [x] Track current sentence index
- [x] Emit `onSentenceChange(index)` event
- [x] Display sentence progress (1/10)
- [ ] Highlight current sentence in reader
- [ ] Scroll to current sentence
- [ ] Animate highlight effect

#### Integration
- [x] Integrate into `ReaderToolbar.tsx`
- [x] Connect to reader blocks
- [x] Connect to current block index
- [x] Emit block change events
- [ ] Sync with scroll position
- [ ] Save playback position

#### Speech API
- [x] Use Web Speech API (`window.speechSynthesis`)
- [x] Handle browser compatibility
- [x] Handle API errors gracefully
- [ ] Add fallback for unsupported browsers
- [ ] Consider OpenAI TTS for premium quality
- [ ] Add voice sample preview

#### UI/UX
- [x] Show play/pause/stop buttons
- [x] Show sentence progress counter
- [ ] Show playback speed control
- [ ] Show voice selector
- [ ] Show volume control
- [ ] Show waveform visualization
- [ ] Add mini player mode

#### Edge Cases
- [x] Handle empty blocks
- [x] Handle image blocks (skip)
- [x] Handle speech synthesis errors
- [ ] Handle page navigation during playback
- [ ] Handle browser tab visibility changes
- [ ] Handle network errors (for remote TTS)

#### Testing
- [ ] Test play/pause/resume flow
- [ ] Test auto-advance behavior
- [ ] Test with various text lengths
- [ ] Test sentence splitting accuracy
- [ ] Test on different browsers
- [ ] Test on mobile devices

### Expected Behavior

**Playback Flow:**
1. User clicks Play button
2. Current block text starts playing
3. Current sentence is highlighted
4. Progress shows (e.g., "3/12")
5. On block end, auto-advances to next block
6. Continues playing until user stops or reaches end

**Controls:**
- **Play:** Start/resume playback
- **Pause:** Pause at current position
- **Stop:** Stop and reset to beginning

**Sentence Detection:**
```typescript
"Hello world. This is a test. How are you?"
→ [
  "Hello world.",
  "This is a test.",
  "How are you?"
]
```

### Technical Implementation

**Web Speech API:**
```typescript
const utterance = new SpeechSynthesisUtterance(text)
utterance.rate = 1.0
utterance.pitch = 1.0
utterance.onboundary = (event) => {
  // Track sentence progress
}
utterance.onend = () => {
  // Auto-advance to next block
}
window.speechSynthesis.speak(utterance)
```

**Sentence Splitting:**
```typescript
const sentences = text.split(/[.!?]+\s+/)
```

### Additional Context

- Web Speech API is free but quality varies by browser
- Consider premium TTS (OpenAI, Google, Amazon) for better quality
- Highlighting should not interfere with reading
- Save playback position for resume across sessions

### Priority
Medium

### Related Issues
- Reading Progress Memory (#2)
- Reading Modes (#4)
