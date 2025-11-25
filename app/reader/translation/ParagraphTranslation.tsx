'use client'

interface ParagraphTranslationProps {
  text: string
  translation?: string
}

export function ParagraphTranslation({ text, translation }: ParagraphTranslationProps) {
  return (
    <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Original</p>
        <p className="text-slate-900 dark:text-slate-100">{text}</p>
      </div>
      {translation && (
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Translation</p>
          <p className="text-blue-600 dark:text-blue-400">{translation}</p>
        </div>
      )}
    </div>
  )
}
