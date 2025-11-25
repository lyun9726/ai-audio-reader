---
name: Block Actions Upgrade
about: Enhanced block-level actions for highlights, notes, and translation
title: '[FEATURE] Block Actions Upgrade - '
labels: enhancement, reader-experience, blocks
assignees: ''
---

## Feature: Block Actions Upgrade

### Description
Upgrade each text block in the reader with quick action buttons for highlighting, adding notes, and translating the entire block, providing a more interactive reading experience.

### Implementation Checklist

#### Core Component
- [x] Create `components/reader/BlockComponent.tsx`
- [x] Render text blocks with styles
- [x] Render image blocks
- [x] Active block highlighting
- [x] Hover state with action buttons

#### Action Buttons
- [x] Highlight button (yellow highlighter icon)
- [x] Note button (pencil icon)
- [x] Translate Block button (translate icon)
- [x] Buttons appear on hover
- [x] Callback props for each action
- [ ] Keyboard shortcuts
- [ ] Quick action menu (right-click)

#### Highlight Integration
- [x] Apply highlights to block text
- [x] Render with color classes
- [x] Support multiple highlights per block
- [ ] Handle overlapping highlights
- [ ] Highlight tooltip on hover
- [ ] Edit highlight color inline

#### Visual Design
- [x] Action buttons in top-right corner
- [x] Smooth fade-in on hover
- [x] Active block border highlight
- [x] Hover background color
- [ ] Block numbering
- [ ] Reading time estimate
- [ ] Word count display

#### Integration
- [x] Integrate into reader page
- [x] Connect to highlight system
- [x] Connect to notes system
- [x] Connect to translation callback
- [ ] Block-level bookmarking
- [ ] Block sharing
- [ ] Block copying

#### Accessibility
- [ ] Keyboard navigation between blocks
- [ ] Screen reader announcements
- [ ] Focus indicators
- [ ] ARIA labels for actions
- [ ] Skip navigation

### Props Interface

```typescript
interface BlockComponentProps {
  block: ReaderBlock
  highlights?: Highlight[]
  onHighlight?: () => void
  onAddNote?: () => void
  onTranslateBlock?: () => void
  isActive?: boolean
}
```

### Expected Behavior

**Normal State:**
```
┌─────────────────────────────────┐
│  This is a paragraph of text.  │
│  It contains multiple sentences │
│  that make up the content.      │
└─────────────────────────────────┘
```

**Hover State:**
```
┌─────────────────────────────────┐
│  This is a paragraph of text.  │ 🖍️ 📝 🌐
│  It contains multiple sentences │
│  that make up the content.      │
└─────────────────────────────────┘
```

**Active State (with highlight):**
```
┌─────────────────────────────────┐ 🟦
│  This is a paragraph of text.  │
│  It contains highlighted words. │
│  that make up the content.      │
└─────────────────────────────────┘
```

### Acceptance Criteria

- [x] Blocks render correctly (text and images)
- [x] Action buttons appear on hover
- [x] Highlight button triggers callback
- [x] Note button triggers callback
- [x] Translate button triggers callback
- [x] Highlights render within text
- [x] Active block has visual indicator
- [ ] Keyboard navigation works
- [ ] Mobile touch-friendly

### Testing Checklist

- [ ] Test with text blocks
- [ ] Test with image blocks
- [ ] Test hover interactions
- [ ] Test button callbacks
- [ ] Test with highlights
- [ ] Test active state
- [ ] Test on mobile (touch)
- [ ] Test in light/dark modes
- [ ] Test keyboard navigation

### Action Buttons

**1. Highlight Button** (🖍️)
- Triggers highlight mode for the block
- Shows highlight color toolbar
- User selects color to apply

**2. Note Button** (📝)
- Opens note input dialog
- Saves note with block reference
- Shows note count badge if notes exist

**3. Translate Block Button** (🌐)
- Translates entire block
- Shows translation inline or in sidebar
- Caches translation for future

### Visual Design Specifications

**Button Styles:**
```css
.action-button {
  padding: 0.5rem;
  background: white;
  border: 1px solid slate-200;
  border-radius: 0.5rem;
  shadow: sm;
  transition: all 0.2s;
}

.action-button:hover {
  background: yellow-100; /* or blue/green based on action */
  transform: scale(1.1);
}
```

**Active Block:**
```css
.block.active {
  background: blue-50;
  border-left: 4px solid blue-500;
  padding-left: 1rem;
}
```

### Future Enhancements

1. **More Actions:**
   - Bookmark block
   - Share block
   - Copy block
   - Print block
   - Read aloud (TTS)
   - Summarize block

2. **Block Metadata:**
   - Reading time
   - Word count
   - Difficulty level
   - Topic tags

3. **Block Relationships:**
   - Link blocks together
   - Create block collections
   - Block dependencies
   - Block references

4. **Smart Actions:**
   - AI-suggested actions
   - Context-aware actions
   - Quick action customization
   - Action history/undo

5. **Collaboration:**
   - Block comments
   - Block discussions
   - Shared block highlights
   - Block assignments

### Mobile Considerations

**Touch Interactions:**
- Long-press to show actions
- Swipe gestures for quick actions
- Tap block to activate
- Double-tap for default action

**Responsive Design:**
- Action buttons larger on mobile
- Bottom sheet for actions on mobile
- Simplified action menu
- Gesture hints for first-time users

### Keyboard Shortcuts

- `H` - Highlight current block
- `N` - Add note to current block
- `T` - Translate current block
- `↑/↓` - Navigate blocks
- `Enter` - Activate block
- `Esc` - Deactivate block

### Priority
High

### Related Issues
- Highlight System (#4)
- Notes Panel 2.0 (#3)
- Inline Translator (#2)
- TTS Reading (#Task 4)
