'use client'

import { Card } from '../common/Card'
import { VoiceCloneStatus } from './VoiceCloneStatus'
import { Button } from '../common/Button'

interface Voice {
  id: string
  name: string
  status: 'ready' | 'training' | 'failed'
}

export function VoiceCard({ voice }: { voice: Voice }) {
  return (
    <Card variant="bordered" className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">{voice.name}</h4>
          <VoiceCloneStatus status={voice.status} />
        </div>
        {voice.status === 'ready' && (
          <Button variant="ghost" size="sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </Button>
        )}
      </div>
    </Card>
  )
}
