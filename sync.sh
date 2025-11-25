#!/bin/bash
echo "=== Git Sync Script ==="
echo "Adding all files..."
git add -A

echo "Committing..."
git commit -m "feat: Add complete UI component tree (74 files)

- Core layout (page.tsx, layout.tsx)
- Common components (Button, Card, Modal, Tabs, etc.)
- Upload module (FileDropzone, FilePicker, UploadProgress)
- Library module (BookCard, BookItem, EmptyState)
- Viewer module (ViewerLayout, ReadingPanel, FontSizeControl, etc.)
- Translation module (TranslationPanel, ParagraphTranslation)
- TTS module (TTSSidebar, VoiceSelector, PlayButton, etc.)
- Languages module (DetectLanguageTag, OriginalLanguageSelector)
- Voices module (VoiceList, VoiceCard, UploadVoiceSample)
- Settings module (SettingsPage, LanguageSettings, AudioSettings)
- History module (HistoryPage, ReadingRecordItem)
- AI modules (DailySummary, MindMap, AskBook)
- Link-Reader module (LinkReaderPanel, URLInputBox)

All UI components are ready for Task 2 logic binding.

🤖 Generated with Claude Code
"

echo "Pushing to GitHub..."
git push origin main

echo "✓ Sync completed!"
