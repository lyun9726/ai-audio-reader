'use client'

export function ReaderSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Default Reading Mode</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="scroll" defaultChecked />
            <span>Scroll</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="paginated" />
            <span>Paginated</span>
          </label>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Font Size</h3>
        <input type="range" min="12" max="32" defaultValue="16" className="w-full max-w-xs" />
      </div>
    </div>
  )
}
