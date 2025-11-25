'use client'

export function LanguageSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Default Translation Language</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>Chinese (Simplified)</option>
          <option>Japanese</option>
          <option>Korean</option>
        </select>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">UI Language</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>English</option>
          <option>涓枃</option>
        </select>
      </div>
    </div>
  )
}
