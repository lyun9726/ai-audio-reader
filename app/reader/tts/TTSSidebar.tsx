'use client'

import { Card } from '../common/Card'
import { VoiceSelector } from './VoiceSelector'
import { SpeedControl } from './SpeedControl'
import { PitchControl } from './PitchControl'
import { CloneVoiceButton } from './CloneVoiceButton'
import { VoicePreview } from './VoicePreview'
import { PlayButton } from './PlayButton'
import { PauseStopButtons } from './PauseStopButtons'

export function TTSSidebar() {
  return (
    <Card variant="bordered" className="p-4 space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Text to Speech</h3>
      <VoiceSelector />
      <SpeedControl />
      <PitchControl />
      <div className="flex gap-2">
        <PlayButton />
        <PauseStopButtons />
      </div>
      <CloneVoiceButton />
      <VoicePreview />
    </Card>
  )
}
