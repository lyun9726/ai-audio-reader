/**
 * Main Reader Page
 * Integrates all reader components with unified state management
 * Provides complete reading experience with TTS, translation, and AI features
 */

'use client'

import { useState } from 'react'
import { useReaderState } from '../hooks/useReaderState'
import { ReaderContent } from '@/components/reader/ReaderContent'
import { EnhancedBottomControlBar } from '@/components/reader/EnhancedBottomControlBar'
import { EnhancedRightSidePanel } from '@/components/reader/EnhancedRightSidePanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, Link as LinkIcon, FileText } from 'lucide-react'

export default function ReaderPage() {
  const readerState = useReaderState()
  const [urlInput, setUrlInput] = useState('')
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)

  // Handle URL loading
  const handleLoadUrl = async () => {
    if (!urlInput.trim()) return

    try {
      await readerState.loadFromUrl(urlInput.trim())
      setIsUrlDialogOpen(false)
      setUrlInput('')
    } catch (error) {
      console.error('[ReaderPage] Failed to load URL:', error)
      alert('Failed to load URL. Please check the URL and try again.')
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await readerState.loadFromFile(file)
      setIsFileDialogOpen(false)
    } catch (error) {
      console.error('[ReaderPage] Failed to load file:', error)
      alert('Failed to load file. Please try again.')
    }
  }

  // Handle AI summary generation
  const handleGenerateSummary = async () => {
    try {
      // Get current chapter blocks (simplified: get all blocks for now)
      const blocks = readerState.state.blocks

      const response = await fetch('/api/ai/deepsummary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: 'current-book',
          blocks: blocks.map((b) => ({
            type: b.type,
            text: b.text,
            level: b.level,
          })),
          level: 'short',
        }),
      })

      const data = await response.json()

      if (data.success && data.summary) {
        alert(`Summary:\n\n${data.summary}`)
      } else {
        throw new Error(data.error || 'Failed to generate summary')
      }
    } catch (error) {
      console.error('[ReaderPage] Summary generation failed:', error)
      alert('Failed to generate summary. This feature requires API keys.')
    }
  }

  // Handle AI question
  const handleAskQuestion = async (question: string) => {
    try {
      const response = await fetch('/api/ai/query-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          bookId: 'current-book',
          query: question,
        }),
      })

      const data = await response.json()

      if (data.success && data.answer) {
        alert(`Answer:\n\n${data.answer}`)
      } else {
        throw new Error(data.error || 'Failed to get answer')
      }
    } catch (error) {
      console.error('[ReaderPage] Question failed:', error)
      alert('Failed to answer question. This feature requires API keys.')
    }
  }

  // Determine layout based on state
  const isRightPanelVisible = readerState.state.layoutMode !== 'single'

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AI Audio Reader</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* URL Input Dialog */}
          <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4 mr-2" />
                Load URL
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load from URL</DialogTitle>
                <DialogDescription>
                  Enter the URL of an article or webpage to read
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="https://example.com/article"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLoadUrl()
                    }
                  }}
                />
                <Button onClick={handleLoadUrl} disabled={!urlInput.trim()}>
                  Load
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* File Upload Dialog */}
          <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a PDF, EPUB, TXT, or DOCX file to read
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Input
                  type="file"
                  accept=".pdf,.epub,.txt,.docx,.md"
                  onChange={handleFileUpload}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Reader Content */}
        <div className="flex-1 overflow-auto">
          <ReaderContent
            className={
              readerState.state.layoutMode === 'split'
                ? 'max-w-3xl mx-auto px-6 py-8'
                : 'max-w-4xl mx-auto px-6 py-8'
            }
          />
        </div>

        {/* Right Side Panel */}
        {isRightPanelVisible && (
          <EnhancedRightSidePanel
            readerState={readerState}
            onGenerateSummary={handleGenerateSummary}
            onAskQuestion={handleAskQuestion}
          />
        )}
      </div>

      {/* Bottom Control Bar */}
      <EnhancedBottomControlBar readerState={readerState} />
    </div>
  )
}
