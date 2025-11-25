'use client'

interface DetectLanguageTagProps {
  language: string
  confidence?: number
}

export function DetectLanguageTag({ language, confidence }: DetectLanguageTagProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{language}</span>
      {confidence && (
        <span className="text-xs text-blue-500">({(confidence * 100).toFixed(0)}%)</span>
      )}
    </div>
  )
}
