'use client'
export function URLInputBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://example.com/article" className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
}
