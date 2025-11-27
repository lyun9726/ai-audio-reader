/**
 * Enhanced Right Side Panel
 * Integrates with useReaderState and AI Deep Reading features
 * Provides TOC, Translation, AI features, and Notes
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { List, Languages, Sparkles, Highlighter, Send } from 'lucide-react'
import { languages } from '@/data/languages'
import { UseReaderStateReturn, ReaderBlock } from '../../hooks/useReaderState'

interface EnhancedRightSidePanelProps {
  readerState: UseReaderStateReturn
  onGenerateSummary?: () => void
  onAskQuestion?: (question: string) => void
}

export function EnhancedRightSidePanel({
  readerState,
  onGenerateSummary,
  onAskQuestion,
}: EnhancedRightSidePanelProps) {
  const {
    state,
    toggleTranslation,
    setTargetLanguage,
    translateAllBlocks,
    goToBlock,
  } = readerState

  const [aiQuestion, setAiQuestion] = useState('')
  const [translationMode, setTranslationMode] = useState<'paragraph' | 'word'>(
    'paragraph'
  )

  // Extract headings for TOC
  const tocItems = state.blocks
    .map((block, index) => ({
      block,
      index,
    }))
    .filter(({ block }) => block.type === 'heading')

  // Handle translation language change
  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang)
    if (state.translationEnabled) {
      // Re-translate with new language
      translateAllBlocks()
    }
  }

  // Handle AI question submission
  const handleAskQuestion = () => {
    if (aiQuestion.trim() && onAskQuestion) {
      onAskQuestion(aiQuestion.trim())
      setAiQuestion('')
    }
  }

  return (
    <div className="w-80 border-l bg-muted/10 flex flex-col h-[calc(100vh-4rem-5rem)]">
      <Tabs defaultValue="toc" className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="toc" title="Table of Contents">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="translate" title="Translation">
              <Languages className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="ai" title="AI Features">
              <Sparkles className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="notes" title="Notes & Highlights">
              <Highlighter className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* ==================== TOC Tab ==================== */}
            <TabsContent value="toc" className="mt-0">
              <h3 className="font-semibold mb-3">Table of Contents</h3>
              {tocItems.length > 0 ? (
                <nav className="space-y-1">
                  {tocItems.map(({ block, index }) => (
                    <Button
                      key={block.id}
                      variant="ghost"
                      className="w-full justify-start text-sm font-normal h-auto py-2 hover:bg-primary/10"
                      style={{
                        paddingLeft: `${((block.level || 1) - 1) * 12 + 16}px`,
                      }}
                      onClick={() => goToBlock(index)}
                    >
                      {block.text}
                    </Button>
                  ))}
                </nav>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No headings found in document
                </p>
              )}
            </TabsContent>

            {/* ==================== Translation Tab ==================== */}
            <TabsContent value="translate" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Translate to</label>
                <Select
                  value={state.targetLanguage}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      translationMode === 'paragraph'
                        ? 'bg-primary/10 border-primary'
                        : ''
                    }
                    onClick={() => setTranslationMode('paragraph')}
                  >
                    Paragraph
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      translationMode === 'word'
                        ? 'bg-primary/10 border-primary'
                        : ''
                    }
                    onClick={() => setTranslationMode('word')}
                    disabled
                  >
                    Word
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant={state.translationEnabled ? 'default' : 'outline'}
                  className="w-full"
                  onClick={toggleTranslation}
                >
                  {state.translationEnabled
                    ? 'Translation Enabled'
                    : 'Enable Translation'}
                </Button>

                {state.translationEnabled && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => translateAllBlocks()}
                    disabled={state.isTranslating}
                  >
                    {state.isTranslating
                      ? 'Translating...'
                      : 'Translate All Blocks'}
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Translated: {state.translations.size}/{state.totalBlocks} blocks
                </p>
                {state.isTranslating && (
                  <p className="text-primary">Translation in progress...</p>
                )}
              </div>
            </TabsContent>

            {/* ==================== AI Tab ==================== */}
            <TabsContent value="ai" className="mt-0 space-y-4">
              {/* Ask the Book */}
              <div className="p-3 bg-primary/5 rounded-lg border">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Sparkles className="h-3 w-3 text-primary" /> Ask the Book
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Ask questions about characters, plot, or themes.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your question..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAskQuestion()
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={handleAskQuestion}
                    disabled={!aiQuestion.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* AI Features */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm bg-transparent"
                  onClick={onGenerateSummary}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Chapter Summary
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm bg-transparent"
                  disabled
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Quiz
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm bg-transparent"
                  disabled
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Flashcards
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm bg-transparent"
                  disabled
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Study Plan
                </Button>
              </div>

              <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                <p className="mb-1 font-medium">AI Features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Layered summaries</li>
                  <li>Interactive quizzes</li>
                  <li>Flashcard generation</li>
                  <li>Cross-chapter Q&A</li>
                </ul>
              </div>
            </TabsContent>

            {/* ==================== Notes Tab ==================== */}
            <TabsContent value="notes" className="mt-0">
              <h3 className="font-semibold mb-3">Notes & Highlights</h3>
              <div className="space-y-3">
                {/* Placeholder for notes */}
                <div className="text-sm text-muted-foreground text-center py-8">
                  <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No notes or highlights yet</p>
                  <p className="text-xs mt-1">
                    Click the highlight button on any block to add
                  </p>
                </div>

                {/* Example note (will be dynamic) */}
                {/* <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
                  <p className="mb-1 italic">"The green light..."</p>
                  <p className="text-xs text-muted-foreground">
                    Symbol of hope and the American Dream.
                  </p>
                </div> */}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
