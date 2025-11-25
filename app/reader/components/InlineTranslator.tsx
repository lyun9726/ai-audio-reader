'use client'

interface InlineTranslatorProps {
  text: string
  onTranslate?: (text: string) => void
  onCopy?: () => void
}

export function InlineTranslator({
  text,
  onTranslate,
  onCopy,
}: InlineTranslatorProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    onCopy?.()
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Translate Button */}
      {onTranslate && (
        <button
          onClick={() => onTranslate(text)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          title="Translate"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          Translate
        </button>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors"
        title="Copy"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy
      </button>
    </div>
  )
}
