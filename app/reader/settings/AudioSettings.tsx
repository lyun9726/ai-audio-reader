'use client'

export function AudioSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Default Voice</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>Alloy</option>
          <option>Echo</option>
          <option>Fable</option>
        </select>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Audio Quality</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>High (MP3 192kbps)</option>
          <option>Medium (MP3 128kbps)</option>
          <option>Low (MP3 64kbps)</option>
        </select>
      </div>
    </div>
  )
}
