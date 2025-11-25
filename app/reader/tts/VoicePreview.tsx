'use client'

export function VoicePreview() {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Preview Text:</p>
      <p className="text-slate-900 dark:text-slate-100 text-sm italic">
        "The quick brown fox jumps over the lazy dog."
      </p>
    </div>
  )
}
