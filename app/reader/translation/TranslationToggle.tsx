'use client'

interface TranslationToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function TranslationToggle({ enabled, onChange }: TranslationToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' +
        (enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600')}
    >
      <span
        className={'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' +
          (enabled ? 'translate-x-6' : 'translate-x-1')}
      />
    </button>
  )
}
