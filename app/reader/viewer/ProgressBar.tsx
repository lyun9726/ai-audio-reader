'use client'

interface ProgressBarProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export function ProgressBar({ current, total, onChange }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="px-6 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="range"
            min="1"
            max={total}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 min-w-[4rem] text-right">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
