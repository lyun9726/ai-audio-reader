'use client'

import { Button } from '../common/Button'
import { Card } from '../common/Card'

interface InlineDictionaryProps {
  word: string
  definition?: string
  onExplain?: (word: string) => void
  onClose?: () => void
}

export function InlineDictionary({
  word,
  definition,
  onExplain,
  onClose,
}: InlineDictionaryProps) {
  return (
    <Card variant="bordered" className="p-4 shadow-xl min-w-[280px] max-w-[400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {word}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            /wɜːrd/
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Definition */}
      <div className="mb-4">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {definition || (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">n.</span> A single distinct meaningful element of speech or writing
              </div>
              <div>
                <span className="font-semibold">v.</span> Express (something spoken or written) in particular words
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Example (placeholder) */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Example:</p>
        <p className="text-sm text-slate-700 dark:text-slate-300 italic">
          "The <span className="font-semibold text-blue-600 dark:text-blue-400">{word}</span> can have multiple meanings."
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onExplain && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onExplain(word)}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Explain with AI
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => {
            navigator.clipboard.writeText(word)
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </Button>
      </div>
    </Card>
  )
}
