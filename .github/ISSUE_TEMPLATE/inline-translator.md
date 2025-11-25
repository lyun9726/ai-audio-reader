---
name: Inline Translator
about: Quick translation toolbar for selected text
title: '[FEATURE] Inline Translator - '
labels: enhancement, reader-experience, translation
assignees: ''
---

## Feature: Inline Translator

### Description
Provide instant translation for selected text with a floating toolbar that appears near the selection, offering quick translate and copy actions.

### Implementation Checklist

#### Core Component
- [x] Create `components/reader/InlineTranslator.tsx`
- [x] Translate button with icon
- [x] Copy button with icon
- [x] Compact toolbar design
- [x] Dark mode support

#### UI/UX
- [x] Floating toolbar near selection
- [x] Smooth fade-in animation
- [x] Responsive positioning
- [x] Visual feedback on actions
- [ ] Translation result display
- [ ] Language selector
- [ ] Loading indicator
- [ ] Error state handling

#### Integration
- [x] Integrate into reader page
- [x] Detect multi-word selection
- [x] Show InlineTranslator component
- [x] Pass callbacks for translate/copy
- [ ] Connect to translation API
- [ ] Cache translations
- [ ] Persist user language preference

#### Translation Features
- [ ] Auto-detect source language
- [ ] Support multiple target languages
- [ ] Show translation inline or in popover
- [ ] Pronunciation of translation
- [ ] Alternative translations
- [ ] Context-aware translation

#### Advanced Features
- [ ] Translation history
- [ ] Favorite translations
- [ ] Export translations
- [ ] Bilingual mode (show both)
- [ ] Sentence analysis
- [ ] Grammar explanations

#### Accessibility
- [ ] Keyboard shortcuts
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Focus indicators
- [ ] ARIA labels

### Props Interface

```typescript
interface InlineTranslatorProps {
  text: string
  onTranslate?: (text: string) => void
  onCopy?: () => void
}
```

### Expected Behavior

**User Flow:**
1. User selects multiple words or a phrase
2. InlineTranslator toolbar appears above selection
3. User can:
   - Click "Translate" to get translation
   - Click "Copy" to copy selected text
4. Toolbar disappears when selection is cleared

**Toolbar Display:**
```
┌─────────────────────────┐
│ [Translate]    [Copy]   │
└─────────────────────────┘
```

**With Translation:**
```
┌─────────────────────────────────┐
│  Original:                      │
│  "Hello, how are you?"          │
│                                 │
│  Translation (中文):            │
│  "你好，你好吗？"                │
│                                 │
│  [Close]           [Copy]       │
└─────────────────────────────────┘
```

### Acceptance Criteria

- [x] Component renders with translate and copy buttons
- [x] Translate button triggers callback with selected text
- [x] Copy button copies text to clipboard
- [x] Toolbar positioned near selection
- [x] Dark mode styling works
- [ ] Translation API integrated
- [ ] Translation result displayed
- [ ] Language selection works
- [ ] Mobile responsive

### Testing Checklist

- [ ] Test with short phrases
- [ ] Test with long paragraphs
- [ ] Test on mobile devices
- [ ] Test in light/dark modes
- [ ] Test keyboard navigation
- [ ] Test copy functionality
- [ ] Test translation accuracy
- [ ] Test error handling

### Technical Notes

**Translation APIs:**
```typescript
// Option 1: Google Translate API (paid)
// Option 2: LibreTranslate (free, self-hosted)
// Option 3: DeepL API (high quality, paid)

// Example with LibreTranslate:
const response = await fetch('https://libretranslate.com/translate', {
  method: 'POST',
  body: JSON.stringify({
    q: text,
    source: 'auto',
    target: 'zh',
  }),
})
```

**Copy Implementation:**
```typescript
const handleCopy = () => {
  navigator.clipboard.writeText(text)
  // Show toast notification
}
```

### Storage Format

**Translation Cache:**
```typescript
localStorage["reader:translations:{bookId}"] = {
  "Hello world": {
    "zh": "你好世界",
    "es": "Hola mundo",
    "timestamp": 1234567890
  }
}
```

### Future Enhancements

1. **Multi-Language Support:**
   - Support 50+ languages
   - Auto-detect source language
   - Language preference memory

2. **Advanced Translation:**
   - Context-aware translation
   - Domain-specific translation (technical, medical, etc.)
   - Formal/informal tone options

3. **Learning Features:**
   - Save translations for review
   - Flashcard generation
   - Translation quiz mode

4. **Integration:**
   - Share translation
   - Export to note-taking apps
   - Integration with language learning apps

### Priority
High

### Related Issues
- Inline Dictionary (#1)
- AI Explain (#Task 3)
- Translation Panel (#Task 3)
