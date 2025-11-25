'use client'

import { useState } from 'react'

export function PitchControl() {
  const [pitch, setPitch] = useState(1.0)

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pitch</label>
        <span className="text-sm text-slate-500">{pitch.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.1"
        value={pitch}
        onChange={(e) => setPitch(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}
