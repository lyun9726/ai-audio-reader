---
name: Highlight System
about: Color-coded text highlighting with localStorage persistence
title: '[FEATURE] Highlight System - '
labels: enhancement, reader-experience, highlights
assignees: ''
---

## Feature: Highlight System

### Description
A comprehensive highlighting system that allows users to highlight text with different colors, manage highlights, and persist them across sessions using localStorage.

### Implementation Checklist

#### Core Module
- [x] Create `lib/reader/highlightManager.ts`
- [x] `loadHighlights(bookId)` function
- [x] `saveHighlights(bookId, highlights)` function
- [x] `addHighlight()` function
- [x] `removeHighlight()` function
- [x] `updateHighlightColor()` function
- [x] `getBlockHighlights()` function
- [x] `clearHighlights()` function

#### Color System
- [x] Yellow highlight
- [x] Blue highlight
- [x] Green highlight
- [x] Pink highlight
- [x] Color presets with Tailwind classes
- [ ] Custom color picker
- [ ] Color opacity control
- [ ] Color naming/labeling

#### UI Components
- [x] Create `HighlightToolbar.tsx`
- [x] Color selection buttons
- [x] Remove highlight button
- [x] Floating toolbar near selection
- [ ] Highlight management panel
- [ ] Highlight statistics
- [ ] Highlight export

#### Integration
- [x] Integrate into reader page
- [x] Render highlights in text blocks
- [x] Selection → show highlight toolbar
- [x] Apply highlight to selected text
- [x] Load highlights on mount
- [ ] Highlight persistence on refresh
- [ ] Highlight merge handling
- [ ] Overlapping highlight support

#### Text Rendering
- [x] Apply highlight styles to text
- [x] Handle single highlights
- [ ] Handle overlapping highlights
- [ ] Handle nested highlights
- [ ] Preserve text selection after highlight
- [ ] Smooth highlight animations

#### Advanced Features
- [ ] Highlight notes (annotation)
- [ ] Highlight categories/tags
- [ ] Highlight search
- [ ] Highlight timeline view
- [ ] Share highlights
- [ ] Collaborative highlighting

### Highlight Interface

```typescript
interface Highlight {
  id: string
  blockId: string
  text: string
  color: HighlightColor
  createdAt: number
  startOffset?: number
  endOffset?: number
}

type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink'
```

### Color Presets

```typescript
const HIGHLIGHT_COLORS = {
  yellow: {
    bg: 'bg-yellow-200 dark:bg-yellow-900/40',
    border: 'border-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-200',
  },
  blue: { /* ... */ },
  green: { /* ... */ },
  pink: { /* ... */ },
}
```

### Expected Behavior

**User Flow:**
1. User selects text
2. Highlight toolbar appears with color options
3. User clicks a color
4. Text is highlighted with chosen color
5. Highlight persists in localStorage
6. On reload, highlights are restored

**Highlight Toolbar:**
```
┌─────────────────────────┐
│ 🟨 🟦 🟩 🟪  │  [×]   │
└─────────────────────────┘
```

**Highlighted Text:**
```
This is normal text, and this is highlighted text, followed by more normal text.
                          ^^^^^^^^^^^^^^^^^^^^
                          (with yellow bg)
```

### Acceptance Criteria

- [x] Highlights saved to localStorage
- [x] Highlights loaded on page mount
- [x] Color selection works
- [x] Remove highlight works
- [x] Highlights render correctly in blocks
- [x] Dark mode support
- [ ] Overlapping highlights handled
- [ ] Export/import highlights
- [ ] Highlight search functionality

### Storage Format

```typescript
localStorage["reader:highlights:{bookId}"] = [
  {
    "id": "highlight-1234567890",
    "blockId": "block-5",
    "text": "important concept",
    "color": "yellow",
    "createdAt": 1234567890,
    "startOffset": 42,
    "endOffset": 59
  }
]
```

### Testing Checklist

- [ ] Test highlight creation
- [ ] Test color change
- [ ] Test highlight removal
- [ ] Test localStorage persistence
- [ ] Test with multiple highlights per block
- [ ] Test with overlapping highlights
- [ ] Test on mobile devices
- [ ] Test in light/dark modes
- [ ] Test export/import

### Technical Notes

**Offset Calculation:**
```typescript
const selection = window.getSelection()
const range = selection.getRangeAt(0)
const startOffset = range.startOffset
const endOffset = range.endOffset
```

**Rendering Highlights:**
```typescript
// Apply highlights to text segments
const segments = applyHighlightsToText(text, highlights)

// Render with React
segments.map((seg, i) =>
  seg.highlight ? (
    <mark key={i} className={colorClasses}>
      {seg.text}
    </mark>
  ) : (
    <span key={i}>{seg.text}</span>
  )
)
```

### Future Enhancements

1. **Advanced Highlighting:**
   - Multi-color gradient highlights
   - Highlight shapes (underline, box, circle)
   - Highlight animations
   - Highlight opacity slider

2. **Organization:**
   - Highlight categories/folders
   - Highlight tags
   - Highlight colors with meanings
   - Auto-categorization by topic

3. **Annotations:**
   - Add notes to highlights
   - Link highlights together
   - Highlight discussions
   - @ mentions in highlight notes

4. **Export/Share:**
   - Export highlights to PDF
   - Export to Markdown
   - Share highlighted passages
   - Generate highlight summary

5. **Smart Features:**
   - AI-suggested highlights
   - Popular highlights (crowd-sourced)
   - Highlight-based Q&A
   - Highlight-based search

### Priority
High

### Related Issues
- Notes Panel 2.0 (#3)
- Block Actions (#5)
- Inline Dictionary (#1)
