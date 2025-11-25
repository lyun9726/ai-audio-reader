'use client'

import { useReaderStore } from '../stores/readerStore'

export function SpeedControl() {
  const rate = useReaderStore(state => state.tts.rate)
  const setRate = useReaderStore(state => state.setRate)

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Speed</label>
        <span className="text-sm text-slate-500">{rate.toFixed(1)}x</span>
      </div>
      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.1"
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}
