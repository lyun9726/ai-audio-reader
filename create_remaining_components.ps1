# Part 2: TTS, Languages, Voices, Settings, History, AI, Link-Reader
$baseDir = "d:/Users/Administrator/Desktop/ai-audio-reader/app/reader"

function Create-Component {
    param($path, $content)
    New-Item -Path $path -ItemType File -Force | Out-Null
    Set-Content -Path $path -Value $content -Encoding UTF8
}

# TTS MODULE (8 files)
Create-Component "$baseDir/tts/TTSSidebar.tsx" @"
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
"@

Create-Component "$baseDir/tts/VoiceSelector.tsx" @"
'use client'

import { useState } from 'react'

export function VoiceSelector() {
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const voices = [
    { id: 'alloy', name: 'Alloy' },
    { id: 'echo', name: 'Echo' },
    { id: 'fable', name: 'Fable' },
    { id: 'onyx', name: 'Onyx' },
    { id: 'nova', name: 'Nova' },
    { id: 'shimmer', name: 'Shimmer' }
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice</label>
      <select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        {voices.map(voice => (
          <option key={voice.id} value={voice.id}>{voice.name}</option>
        ))}
      </select>
    </div>
  )
}
"@

Create-Component "$baseDir/tts/SpeedControl.tsx" @"
'use client'

import { useState } from 'react'

export function SpeedControl() {
  const [speed, setSpeed] = useState(1.0)

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Speed</label>
        <span className="text-sm text-slate-500">{speed.toFixed(1)}x</span>
      </div>
      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.1"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}
"@

Create-Component "$baseDir/tts/PitchControl.tsx" @"
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
"@

Create-Component "$baseDir/tts/CloneVoiceButton.tsx" @"
'use client'

import { Button } from '../common/Button'

export function CloneVoiceButton() {
  return (
    <Button variant="outline" className="w-full">
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
      Clone Your Voice
    </Button>
  )
}
"@

Create-Component "$baseDir/tts/VoicePreview.tsx" @"
'use client'

export function VoicePreview() {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Preview Text:</p>
      <p className="text-slate-900 dark:text-slate-100 text-sm italic">
        "The quick brown fox jumps over the lazy dog."
      </p>
    </div>
  )
}
"@

Create-Component "$baseDir/tts/PlayButton.tsx" @"
'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

export function PlayButton() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <Button
      variant="primary"
      className="flex-1"
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {isPlaying ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )}
    </Button>
  )
}
"@

Create-Component "$baseDir/tts/PauseStopButtons.tsx" @"
'use client'

import { Button } from '../common/Button'

export function PauseStopButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </Button>
      <Button variant="outline" size="sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
        </svg>
      </Button>
    </div>
  )
}
"@

Write-Host "✓ TTS module (8 files) created"

# LANGUAGES MODULE (2 files)
Create-Component "$baseDir/languages/DetectLanguageTag.tsx" @"
'use client'

interface DetectLanguageTagProps {
  language: string
  confidence?: number
}

export function DetectLanguageTag({ language, confidence }: DetectLanguageTagProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full">
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{language}</span>
      {confidence && (
        <span className="text-xs text-blue-500">({(confidence * 100).toFixed(0)}%)</span>
      )}
    </div>
  )
}
"@

Create-Component "$baseDir/languages/OriginalLanguageSelector.tsx" @"
'use client'

interface OriginalLanguageSelectorProps {
  value: string
  onChange: (lang: string) => void
}

export function OriginalLanguageSelector({ value, onChange }: OriginalLanguageSelectorProps) {
  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Original Language:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
    </div>
  )
}
"@

Write-Host "✓ Languages module (2 files) created"

# VOICES MODULE (4 files)
Create-Component "$baseDir/voices/VoiceList.tsx" @"
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
"@

Create-Component "$baseDir/voices/VoiceCard.tsx" @"
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
"@

Create-Component "$baseDir/voices/UploadVoiceSample.tsx" @"
'use client'

import { useRef } from 'react'
import { Button } from '../common/Button'

export function UploadVoiceSample() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
      />
      <Button
        variant="primary"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Upload Voice
      </Button>
    </>
  )
}
"@

Create-Component "$baseDir/voices/VoiceCloneStatus.tsx" @"
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
"@

Write-Host "✓ Voices module (4 files) created"

# SETTINGS MODULE (5 files)
Create-Component "$baseDir/settings/SettingsPage.tsx" @"
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
"@

Create-Component "$baseDir/settings/LanguageSettings.tsx" @"
'use client'

export function LanguageSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Default Translation Language</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>Chinese (Simplified)</option>
          <option>Japanese</option>
          <option>Korean</option>
        </select>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">UI Language</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>English</option>
          <option>中文</option>
        </select>
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/settings/AudioSettings.tsx" @"
'use client'

export function AudioSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Default Voice</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>Alloy</option>
          <option>Echo</option>
          <option>Fable</option>
        </select>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Audio Quality</h3>
        <select className="w-full max-w-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg">
          <option>High (MP3 192kbps)</option>
          <option>Medium (MP3 128kbps)</option>
          <option>Low (MP3 64kbps)</option>
        </select>
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/settings/ReaderSettings.tsx" @"
'use client'

export function ReaderSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Default Reading Mode</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="scroll" defaultChecked />
            <span>Scroll</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" value="paginated" />
            <span>Paginated</span>
          </label>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Font Size</h3>
        <input type="range" min="12" max="32" defaultValue="16" className="w-full max-w-xs" />
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/settings/CacheSettings.tsx" @"
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
"@

Write-Host "✓ Settings module (5 files) created"

# HISTORY MODULE (3 files)
Create-Component "$baseDir/history/HistoryPage.tsx" @"
'use client'

import { Card } from '../common/Card'
import { ReadingRecordItem } from './ReadingRecordItem'
import { ClearHistoryButton } from './ClearHistoryButton'

export function HistoryPage() {
  const records = [
    { id: '1', bookTitle: 'Sample Book', lastRead: '2024-01-20', progress: 45 },
    { id: '2', bookTitle: 'Another Book', lastRead: '2024-01-19', progress: 78 },
  ]

  return (
    <Card variant="bordered" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reading History</h1>
        <ClearHistoryButton />
      </div>
      <div className="space-y-3">
        {records.map(record => (
          <ReadingRecordItem key={record.id} record={record} />
        ))}
      </div>
    </Card>
  )
}
"@

Create-Component "$baseDir/history/ReadingRecordItem.tsx" @"
'use client'

interface Record {
  id: string
  bookTitle: string
  lastRead: string
  progress: number
}

export function ReadingRecordItem({ record }: { record: Record }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
      <div className="flex-1">
        <h3 className="font-medium text-slate-900 dark:text-slate-100">{record.bookTitle}</h3>
        <p className="text-sm text-slate-500">Last read: {record.lastRead}</p>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{record.progress}%</span>
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/history/ClearHistoryButton.tsx" @"
'use client'

import { Button } from '../common/Button'

export function ClearHistoryButton() {
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all reading history?')) {
      // Logic in Task 2
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClear}>
      Clear All
    </Button>
  )
}
"@

Write-Host "✓ History module (3 files) created"

Write-Host "`n=== Part 2 completed ===" -ForegroundColor Green
