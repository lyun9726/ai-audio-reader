'use client'

import { Card } from '../common/Card'
import { Tabs } from '../common/Tabs'
import { LanguageSettings } from './LanguageSettings'
import { AudioSettings } from './AudioSettings'
import { ReaderSettings } from './ReaderSettings'
import { CacheSettings } from './CacheSettings'

export function SettingsPage() {
  return (
    <Card variant="bordered" className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Settings</h1>
      <Tabs
        tabs={[
          { id: 'language', label: 'Language' },
          { id: 'audio', label: 'Audio' },
          { id: 'reader', label: 'Reader' },
          { id: 'cache', label: 'Cache' }
        ]}
      >
        {(activeTab) => {
          switch (activeTab) {
            case 'language': return <LanguageSettings />
            case 'audio': return <AudioSettings />
            case 'reader': return <ReaderSettings />
            case 'cache': return <CacheSettings />
            default: return null
          }
        }}
      </Tabs>
    </Card>
  )
}
