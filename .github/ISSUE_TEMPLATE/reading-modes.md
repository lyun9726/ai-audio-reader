---
name: Reading Modes
about: Light, Dark, and Focus reading modes
title: '[FEATURE] Reading Modes - '
labels: enhancement, reader-experience, ui
assignees: ''
---

## Feature: Reading Modes

### Description
Provide three distinct reading modes (Light, Dark, Focus) to accommodate different reading preferences and environments, with localStorage persistence.

### Implementation Checklist

#### Core Component
- [x] Create `app/reader/components/ReadingModeToggle.tsx`
- [x] Implement mode toggle UI (3 buttons)
- [x] Implement `useReadingMode()` hook
- [x] Add localStorage persistence
- [x] Add SSR safety guards

#### Modes

**Light Mode:**
- [x] Default white/light background
- [x] Dark text on light background
- [x] Show all UI elements
- [x] Standard contrast

**Dark Mode:**
- [x] Dark background (slate-900)
- [x] Light text on dark background
- [x] Show all UI elements
- [x] Reduced blue light

**Focus Mode:**
- [x] Hide sidebar
- [x] Hide header/toolbar
- [x] Hide floating elements
- [x] Center content (max-width)
- [x] Minimal distractions
- [x] Show ESC hint to exit
- [ ] Add reading guide line
- [ ] Add auto-hide cursor

#### Integration
- [x] Integrate into reader page
- [x] Apply mode to all UI components
- [x] Hide/show elements based on mode
- [x] Persist mode across sessions
- [ ] Add keyboard shortcut (F for focus)
- [ ] Add smooth transitions

#### UI Enhancements
- [ ] Add sepia/warm mode
- [ ] Add custom color themes
- [ ] Add brightness slider
- [ ] Add font size controls
- [ ] Add line height controls
- [ ] Add reading width controls

#### Accessibility
- [ ] Ensure sufficient contrast in all modes
- [ ] Add high contrast mode option
- [ ] Support system dark mode preference
- [ ] Add reduced motion option
- [ ] Test with screen readers

#### Testing
- [ ] Test mode switching
- [ ] Test localStorage persistence
- [ ] Test focus mode UI hiding
- [ ] Test ESC key in focus mode
- [ ] Test with different screen sizes
- [ ] Test SSR/hydration

### Expected Behavior

**Mode Switching:**
1. User clicks mode toggle button
2. UI instantly switches to selected mode
3. Preference saved to localStorage
4. Persists across page reloads

**Focus Mode:**
1. User selects Focus mode
2. Sidebar slides out
3. Toolbar fades out
4. Content centers with max-width
5. ESC hint appears at top
6. Press ESC to exit back to previous mode

**Storage Format:**
```
localStorage["reader:mode"] = "light" | "dark" | "focus"
```

### Design Specifications

**Light Mode:**
- Background: `bg-white`
- Text: `text-slate-900`
- Borders: `border-slate-200`

**Dark Mode:**
- Background: `bg-slate-900`
- Text: `text-slate-100`
- Borders: `border-slate-700`

**Focus Mode:**
- Inherits light/dark theme
- Content: `max-w-4xl mx-auto`
- No sidebars, no toolbars
- ESC hint: `fixed top-4 left-1/2`

### Additional Context

- Focus mode should provide distraction-free reading
- Consider adding zen/minimal mode
- Future: Add scheduled mode switching (dark at night)
- Future: Add e-ink optimized mode

### Priority
Medium

### Related Issues
- Reading Progress Memory (#2)
- TTS Reading Engine (#5)
