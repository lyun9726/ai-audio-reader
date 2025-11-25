---
name: Auto Formatting Enhancement
about: Improve text block auto-formatting for better reading experience
title: '[FEATURE] Auto Formatting - '
labels: enhancement, reader-experience
assignees: ''
---

## Feature: Auto Formatting

### Description
Implement intelligent text block formatting to improve reading experience by merging short paragraphs, splitting long ones, and fixing common formatting issues.

### Implementation Checklist

#### Core Functionality
- [x] Create `lib/reader/cleanBlocks.ts`
- [x] Implement `cleanBlocks(blocks)` function
- [x] Merge short paragraphs (<40 chars)
- [x] Split long paragraphs (>300 chars at sentence boundaries)
- [x] Remove duplicate empty lines
- [x] Fix hyphen line-break words ("inter-\nnational" → "international")
- [x] Normalize whitespace (tabs, multiple spaces)
- [x] Preserve original block order and IDs

#### User Settings
- [x] Add localStorage setting `reader:autoFormat`
- [x] Implement `getAutoFormatSetting()` function
- [x] Implement `setAutoFormatSetting(enabled)` function
- [x] Default to enabled (true)

#### Integration
- [x] Integrate into `ReaderEngine.parseFromUrl()`
- [x] Apply formatting after Readability extraction
- [x] Apply formatting to demo content
- [ ] Add UI toggle in reader settings
- [ ] Add format preview/comparison view
- [ ] Add undo/redo formatting

#### Testing
- [ ] Test with short paragraphs
- [ ] Test with long paragraphs (>300 chars)
- [ ] Test with hyphenated words
- [ ] Test with mixed content (text + images)
- [ ] Test localStorage persistence
- [ ] Test SSR compatibility

### Expected Behavior

**Before Formatting:**
```
This is short.

This is a very long paragraph that goes on and on and on without any breaks making it difficult to read because there are no natural pauses or sentence boundaries that would make it easier for the reader to process the information being presented here and it just keeps going...

Another
short one.
```

**After Formatting:**
```
This is short. Another short one.

This is a very long paragraph that goes on and on and on without any breaks making it difficult to read because there are no natural pauses or sentence boundaries that would make it easier for the reader to process the information being presented here.

And it just keeps going...
```

### Additional Context

- Formatting should be non-destructive
- Original content should be preserved in block metadata
- User should be able to toggle formatting on/off
- Formatting should not affect images or code blocks

### Priority
Medium

### Related Issues
- Reading Progress Memory (#2)
- Reading Modes (#4)
