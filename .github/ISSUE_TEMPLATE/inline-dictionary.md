---
name: Inline Dictionary
about: Word lookup with AI explanation
title: '[FEATURE] Inline Dictionary - '
labels: enhancement, reader-experience, dictionary
assignees: ''
---

## Feature: Inline Dictionary

### Description
Provide instant word definitions when users select any word in the reader, with the option to get AI-powered explanations for deeper understanding.

### Implementation Checklist

#### Core Component
- [x] Create `components/reader/InlineDictionary.tsx`
- [x] Display word with pronunciation
- [x] Show placeholder definition
- [x] Add "Explain with AI" button
- [x] Add "Copy" button
- [x] Close button functionality

#### UI/UX
- [x] Popover appears near selected word
- [x] Responsive design (mobile/desktop)
- [x] Dark mode support
- [x] Smooth animations
- [ ] Loading state for AI explanations
- [ ] Multiple definitions support
- [ ] Part of speech indicators (n., v., adj.)
- [ ] Example sentences

#### Integration
- [x] Integrate into reader page
- [x] Detect single-word selection
- [x] Show InlineDictionary component
- [x] Pass callbacks for AI explanation
- [ ] Connect to real dictionary API
- [ ] Cache definitions locally
- [ ] Offline support with stored definitions

#### Advanced Features
- [ ] Pronunciation audio (text-to-speech)
- [ ] Etymology information
- [ ] Related words/synonyms
- [ ] Word frequency indicator
- [ ] Add to vocabulary list
- [ ] Flashcard creation
- [ ] Translation to other languages

#### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Focus management
- [ ] ARIA labels

### Props Interface

```typescript
interface InlineDictionaryProps {
  word: string
  definition?: string
  onExplain?: (word: string) => void
  onClose?: () => void
}
```

### Expected Behavior

**User Flow:**
1. User selects a single word
2. InlineDictionary popover appears above selection
3. Shows word, pronunciation, and definition
4. User can:
   - Click "Explain with AI" for detailed explanation
   - Click "Copy" to copy the word
   - Click X to close
   - Press ESC to close

**Example Display:**
```
┌─────────────────────────────────┐
│  dictionary                  ✕  │
│  /ˈdɪkʃənri/                    │
│                                 │
│  n. A book or electronic resource│
│  that lists words and their     │
│  meanings                       │
│                                 │
│  Example:                       │
│  "Look it up in the dictionary" │
│                                 │
│  [Explain with AI]    [Copy]    │
└─────────────────────────────────┘
```

### Acceptance Criteria

- [x] Component renders with word and placeholder definition
- [x] "Explain with AI" button triggers callback
- [x] "Copy" button copies word to clipboard
- [x] Close button dismisses popover
- [x] Dark mode styling works correctly
- [ ] Real dictionary API integration
- [ ] Loading states implemented
- [ ] Error handling for API failures
- [ ] Mobile responsive design tested

### Testing Checklist

- [ ] Test with various words (short/long)
- [ ] Test on mobile devices
- [ ] Test in light/dark modes
- [ ] Test keyboard shortcuts
- [ ] Test with screen readers
- [ ] Test copy functionality
- [ ] Test AI explanation callback

### Technical Notes

**Placeholder Definition:**
Currently shows mock definition. To integrate real dictionary:
```typescript
// Use Free Dictionary API
const response = await fetch(
  `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
)
const data = await response.json()
```

**Position Calculation:**
Uses `getBoundingClientRect()` to position near selection.

### Future Enhancements

1. **Dictionary Sources:**
   - Multiple dictionary APIs (Merriam-Webster, Oxford, etc.)
   - User preference for dictionary source
   - Offline dictionary database

2. **Learning Features:**
   - Save words to vocabulary list
   - Spaced repetition flashcards
   - Quiz mode
   - Progress tracking

3. **Advanced Display:**
   - Word origin/etymology
   - Usage over time graph
   - Collocations
   - Idioms and phrases

### Priority
High

### Related Issues
- Inline Translator (#2)
- AI Explain (#Task 3)
