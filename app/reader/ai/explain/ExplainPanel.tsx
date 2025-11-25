'use client'

import { useState } from 'react'
import { Card } from '../../common/Card'
import { Button } from '../../common/Button'
import { useReaderStore } from '../../stores/readerStore'
import { useAI } from '../../hooks/useAI'

export function ExplainPanel() {
  const [selectedText, setSelectedText] = useState('')
  const blocks = useReaderStore(state => state.blocks)
  const { explanation, explainText, isStreaming, clearExplanation } = useAI()

  const handleGetSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (text) {
      setSelectedText(text)
    }
  }

  const handleExplain = async () => {
    if (!selectedText) return
    await explainText(blocks, selectedText)
  }

  const handleClear = () => {
    setSelectedText('')
    clearExplanation()
  }

  return (
    <Card variant="bordered" className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Explain
      </h2>

      <div className="space-y-4">
        {/* Instructions */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Select text in the reader, then click "Get Selection" to explain it.
          </p>
        </div>

        {/* Get Selection Button */}
        <Button variant="secondary" onClick={handleGetSelection} className="w-full">
          Get Selection
        </Button>

        {/* Selected Text */}
        {selectedText && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Selected Text:
            </p>
            <p className="text-slate-900 dark:text-slate-100 italic">"{selectedText}"</p>
          </div>
        )}

        {/* Explain Button */}
        {selectedText && !explanation && (
          <Button
            variant="primary"
            onClick={handleExplain}
            disabled={isStreaming}
            className="w-full"
          >
            {isStreaming ? 'Explaining...' : 'Explain This'}
          </Button>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{explanation}</div>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1" />
                )}
              </div>
            </div>

            {!isStreaming && (
              <Button variant="secondary" onClick={handleClear} className="w-full">
                Clear & Select New Text
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
