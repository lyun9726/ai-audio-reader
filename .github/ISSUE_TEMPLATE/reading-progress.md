---
name: Reading Progress Memory
about: Save and restore reading position across sessions
title: '[FEATURE] Reading Progress Memory - '
labels: enhancement, reader-experience
assignees: ''
---

## Feature: Reading Progress Memory

### Description
Automatically save and restore the user's reading position (block index and scroll position) when they return to a book, providing a seamless reading experience across sessions.

### Implementation Checklist

#### Core Functionality
- [x] Create `lib/reader/useReadingProgress.ts`
- [x] Implement `loadProgress(bookId)` function
- [x] Implement `saveProgress(bookId, index, scrollY)` function
- [x] Implement `clearProgress(bookId)` function
- [x] Implement `useReadingProgress(bookId)` hook
- [x] Implement `useAutoSaveProgress(bookId, currentIndex, throttleMs)` hook

#### Storage
- [x] Use localStorage with key format `reader:progress:{bookId}`
- [x] Store block index
- [x] Store scroll Y position
- [x] Store timestamp
- [x] Add SSR safety guards

#### Integration
- [x] Integrate into reader page `app/reader/[bookId]/page.tsx`
- [x] Restore progress on mount
- [x] Restore scroll position after content loads
- [x] Auto-save on block change
- [x] Auto-save on scroll (throttled to 2s)

#### UI/UX
- [ ] Show "Resume reading" indicator
- [ ] Add progress percentage display
- [ ] Add "Start from beginning" option
- [ ] Add progress history view
- [ ] Add cross-device sync (future)

#### Edge Cases
- [x] Handle missing bookId
- [x] Handle corrupted localStorage data
- [x] Handle localStorage quota exceeded
- [ ] Handle book content changes (different version)
- [ ] Handle deleted/removed blocks

#### Testing
- [ ] Test save/restore flow
- [ ] Test scroll position restoration
- [ ] Test multiple books
- [ ] Test localStorage quota
- [ ] Test SSR/hydration
- [ ] Test throttling behavior

### Expected Behavior

**User Flow:**
1. User reads to block #45, scrolls to middle of page
2. User closes browser/tab
3. User returns later
4. Page automatically scrolls to previous position
5. Reading continues from block #45

**Storage Format:**
```json
{
  "index": 45,
  "scrollY": 2340,
  "timestamp": 1234567890
}
```

### Additional Context

- Progress should be saved automatically without user action
- Throttle scroll saves to avoid performance issues
- Consider adding visual indicator of saved progress
- Future: Sync across devices using backend

### Priority
High

### Related Issues
- Auto Formatting (#1)
- TTS Reading Engine (#5)
