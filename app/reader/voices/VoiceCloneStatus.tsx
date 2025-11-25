'use client'

interface VoiceCloneStatusProps {
  status: 'ready' | 'training' | 'failed'
}

export function VoiceCloneStatus({ status }: VoiceCloneStatusProps) {
  const statusConfig = {
    ready: { color: 'text-green-600 dark:text-green-400', label: 'Ready' },
    training: { color: 'text-yellow-600 dark:text-yellow-400', label: 'Training...' },
    failed: { color: 'text-red-600 dark:text-red-400', label: 'Failed' }
  }

  const config = statusConfig[status]

  return (
    <span className={'text-sm font-medium ' + config.color}>
      {config.label}
    </span>
  )
}
