'use client'

import { useState } from 'react'
import { Card } from '../common/Card'
import { TranslationLanguageSelector } from './TranslationLanguageSelector'
import { TranslationToggle } from './TranslationToggle'
import { ParagraphTranslation } from './ParagraphTranslation'

export function TranslationPanel() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [targetLang, setTargetLang] = useState('zh')

  return (
    <Card variant="bordered" className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Translation</h3>
        <TranslationToggle enabled={isEnabled} onChange={setIsEnabled} />
      </div>
      {isEnabled && (
        <>
          <TranslationLanguageSelector value={targetLang} onChange={setTargetLang} />
          <ParagraphTranslation text="Sample paragraph..." translation="绀轰緥娈佃惤..." />
        </>
      )}
    </Card>
  )
}
