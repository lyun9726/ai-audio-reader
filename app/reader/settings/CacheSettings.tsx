'use client'

import { Button } from '../common/Button'

export function CacheSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Translation Cache</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Cache translated paragraphs to reduce API calls
        </p>
        <Button variant="outline">Clear Translation Cache</Button>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Audio Cache</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Cache generated audio files
        </p>
        <Button variant="outline">Clear Audio Cache</Button>
      </div>
    </div>
  )
}
