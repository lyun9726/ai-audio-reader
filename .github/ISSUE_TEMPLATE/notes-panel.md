---
name: Notes Panel 2.0
about: Enhanced notes system with search, edit, and highlight preview
title: '[FEATURE] Notes Panel 2.0 - '
labels: enhancement, reader-experience, notes
assignees: ''
---

## Feature: Notes Panel 2.0

### Description
An enhanced notes panel that allows users to create, edit, search, and manage notes with highlight previews, all persisted in localStorage.

### Implementation Checklist

#### Core Component
- [x] Create `components/reader/NotesPanel.tsx`
- [x] Display notes list
- [x] Search bar at top
- [x] Edit note functionality
- [x] Delete note functionality
- [x] Highlight preview in notes
- [x] localStorage persistence

#### Note Features
- [x] Note creation with text
- [x] Note editing inline
- [x] Note deletion with confirmation
- [x] Timestamp display
- [x] Block association (blockId)
- [x] Highlight preview (first 100 chars)
- [ ] Rich text editor
- [ ] Markdown support
- [ ] Tags/categories
- [ ] Color coding

#### Search & Filter
- [x] Search by note text
- [x] Search by highlight preview
- [ ] Filter by date
- [ ] Filter by block
- [ ] Sort options (date, alphabetical)
- [ ] Advanced search (regex)

#### Integration
- [x] Integrate into reader sidebar
- [x] Click note to jump to block
- [x] Add note from block action button
- [x] useNotes hook for state management
- [ ] Sync notes with backend
- [ ] Export notes (JSON/Markdown)
- [ ] Import notes

#### UI/UX
- [x] Empty state message
- [x] Note count display
- [x] Responsive design
- [x] Dark mode support
- [ ] Drag to reorder
- [ ] Bulk actions (select multiple)
- [ ] Note templates
- [ ] Quick note shortcut

#### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management
- [ ] ARIA labels
- [ ] High contrast mode

### Note Interface

```typescript
interface Note {
  id: string
  text: string
  blockId: string
  createdAt: number
  highlightPreview?: string
}
```

### Expected Behavior

**User Flow:**
1. User selects text and clicks "Add Note"
2. Prompt appears for note text
3. Note saved with highlight preview
4. Note appears in Notes Panel
5. Click note to jump to associated block
6. Edit/delete notes as needed

**Notes Panel Display:**
```
┌─────────────────────────────────┐
│  Notes (5)                      │
│  ┌───────────────────────────┐  │
│  │ 🔍 Search notes...       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ "...selected text..."     │  │
│  │                           │  │
│  │ This is my note about     │  │
│  │ this paragraph.           │  │
│  │                           │  │
│  │ 2024-01-15    [Edit] [×]  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Another note...           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Acceptance Criteria

- [x] Notes persist in localStorage
- [x] Search filters notes correctly
- [x] Edit functionality works
- [x] Delete functionality works with confirmation
- [x] Click note scrolls to block
- [x] Highlight preview displays correctly
- [x] Empty state shows appropriate message
- [ ] Export/import functionality
- [ ] Rich text editing
- [ ] Tag system implemented

### Storage Format

```typescript
localStorage["reader:notes:{bookId}"] = [
  {
    "id": "note-1234567890",
    "text": "Important point about...",
    "blockId": "block-5",
    "createdAt": 1234567890,
    "highlightPreview": "This is the selected text that was highlighted..."
  }
]
```

### Testing Checklist

- [ ] Test note creation
- [ ] Test note editing
- [ ] Test note deletion
- [ ] Test search functionality
- [ ] Test note click navigation
- [ ] Test localStorage persistence
- [ ] Test with many notes (100+)
- [ ] Test on mobile devices
- [ ] Test in light/dark modes

### useNotes Hook

```typescript
const { notes, addNote, updateNote, deleteNote } = useNotes(bookId)

// Add note
const note = addNote(
  'My note text',
  'block-123',
  'Highlighted text preview'
)

// Update note
updateNote(note.id, 'Updated text')

// Delete note
deleteNote(note.id)
```

### Future Enhancements

1. **Rich Features:**
   - Markdown support with preview
   - Image attachments
   - Link attachments
   - Voice notes

2. **Organization:**
   - Folders/categories
   - Tags with autocomplete
   - Color labels
   - Pinned notes

3. **Collaboration:**
   - Share notes
   - Public/private notes
   - Comments on notes
   - Note discussions

4. **Export/Sync:**
   - Export to Notion
   - Export to Evernote
   - Export to Markdown
   - Cloud sync across devices

5. **Smart Features:**
   - AI-generated summaries of notes
   - Auto-tagging
   - Related notes suggestions
   - Search by semantic similarity

### Priority
High

### Related Issues
- Highlight System (#4)
- Block Actions (#5)
- AI Summary (#Task 3)
