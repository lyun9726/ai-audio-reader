---
name: AI Smart Floating Button
about: Floating AI assistant button with quick actions
title: '[FEATURE] AI Floating Assistant - '
labels: enhancement, ai-features
assignees: ''
---

## Feature: AI Smart Floating Button

### Description
A floating action button that provides quick access to AI-powered features (Ask, Summarize, Explain, Mindmap) without opening the full sidebar.

### Implementation Checklist

#### Core Component
- [x] Create `app/reader/components/AIActionFloat.tsx`
- [x] Implement floating button (bottom-right)
- [x] Implement action sheet overlay
- [x] Add backdrop with click-to-close
- [x] Add slide-in animation

#### Actions
- [x] Ask the Book (Q&A)
- [x] Summarize Section
- [x] Explain Selected Text (disabled when no selection)
- [x] Generate Mindmap

#### Features
- [x] Show selected text preview in action sheet
- [x] Accept callback props (onAsk, onSummary, onExplain, onMindmap)
- [x] No backend logic (props-based)
- [x] Responsive design
- [x] Dark mode support

#### Integration
- [x] Integrate into reader page
- [x] Position above bottom control bar
- [x] Hide in focus mode
- [x] Connect to AI sidebar tabs
- [ ] Add keyboard shortcuts (e.g., Cmd+K for Ask)
- [ ] Add gesture support (swipe up to open)

#### UI/UX Enhancements
- [ ] Add tooltip on hover
- [ ] Add badge for new features
- [ ] Add quick history (recent questions/summaries)
- [ ] Add drag-to-reposition
- [ ] Add minimize/expand states
- [ ] Add notification dot for pending responses

#### Accessibility
- [ ] Add ARIA labels
- [ ] Add keyboard navigation
- [ ] Add screen reader support
- [ ] Add focus trap in action sheet
- [ ] Add ESC to close

#### Testing
- [ ] Test on mobile devices
- [ ] Test with text selection
- [ ] Test without text selection
- [ ] Test in focus mode
- [ ] Test animations
- [ ] Test backdrop behavior

### Expected Behavior

**Default State:**
- Floating blue button in bottom-right corner
- Icon: Lightbulb/AI symbol
- Fixed position, always visible (except focus mode)

**On Click:**
- Action sheet slides up from bottom
- Backdrop appears with blur
- Shows 4 action buttons with icons
- Shows selected text preview if available

**Actions:**
- Ask: Opens Q&A tab in sidebar
- Summarize: Opens Summary tab in sidebar
- Explain: Opens Explain tab with selected text
- Mindmap: Opens Mindmap tab in sidebar

### Design Reference

```
┌─────────────────────────────────┐
│                                 │
│  AI Assistant                   │
│                                 │
│  Selected Text:                 │
│  "artificial intelligence..."   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 💬 Ask the Book         │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 📝 Summarize Section    │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 💡 Explain Selected     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 🗺️  Generate Mindmap    │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Additional Context

- Button should not interfere with reading
- Should work seamlessly with sidebar
- Consider mobile bottom navigation bar
- Future: Add voice input for "Ask"

### Priority
High

### Related Issues
- AI Summary (#Task 3)
- AI Q&A (#Task 3)
- AI Explain (#Task 3)
- AI Mindmap (#Task 3)
