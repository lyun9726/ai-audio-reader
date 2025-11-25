'use client'

import { VoiceCard } from './VoiceCard'
import { UploadVoiceSample } from './UploadVoiceSample'

export function VoiceList() {
  const voices = [
    { id: '1', name: 'My Voice', status: 'ready' as const },
    { id: '2', name: 'Clone 1', status: 'training' as const },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">My Voices</h3>
        <UploadVoiceSample />
      </div>
      <div className="grid gap-3">
        {voices.map(voice => (
          <VoiceCard key={voice.id} voice={voice} />
        ))}
      </div>
    </div>
  )
}
