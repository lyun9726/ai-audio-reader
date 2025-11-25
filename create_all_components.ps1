# PowerShell script to create all remaining UI components
$baseDir = "d:/Users/Administrator/Desktop/ai-audio-reader/app/reader"

# Function to create file with content
function Create-Component {
    param($path, $content)
    New-Item -Path $path -ItemType File -Force | Out-Null
    Set-Content -Path $path -Value $content -Encoding UTF8
}

# VIEWER MODULE
Create-Component "$baseDir/viewer/ViewerLayout.tsx" @"
'use client'

import { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { ReadingToolbar } from './ReadingToolbar'
import { ProgressBar } from './ProgressBar'

interface ViewerLayoutProps {
  children: ReactNode
  bookTitle: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ViewerLayout({ children, bookTitle, currentPage, totalPages, onPageChange }: ViewerLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
      <TopBar title={bookTitle} />
      <ProgressBar current={currentPage} total={totalPages} onChange={onPageChange} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      <ReadingToolbar />
    </div>
  )
}
"@

Create-Component "$baseDir/viewer/TopBar.tsx" @"
'use client'

import Link from 'next/link'
import { Button } from '../common/Button'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reader/library">
            <Button variant="ghost" size="sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 truncate max-w-md">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
}
"@

Create-Component "$baseDir/viewer/ReadingPanel.tsx" @"
'use client'

import { useState } from 'react'
import { ScrollReading } from './ScrollReading'
import { PaginatedReading } from './PaginatedReading'
import { Tabs } from '../common/Tabs'

interface ReadingPanelProps {
  content: string
}

export function ReadingPanel({ content }: ReadingPanelProps) {
  const [mode, setMode] = useState<'scroll' | 'paginated'>('scroll')

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-2">
        <Tabs
          tabs={[
            { id: 'scroll', label: 'Scroll' },
            { id: 'paginated', label: 'Paginated' }
          ]}
          defaultTab={mode}
        >
          {(activeTab) => {
            setMode(activeTab as 'scroll' | 'paginated')
            return null
          }}
        </Tabs>
      </div>
      <div className="flex-1 overflow-hidden">
        {mode === 'scroll' ? (
          <ScrollReading content={content} />
        ) : (
          <PaginatedReading content={content} />
        )}
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/viewer/ScrollReading.tsx" @"
'use client'

import { useEffect, useRef } from 'react'

interface ScrollReadingProps {
  content: string
}

export function ScrollReading({ content }: ScrollReadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Restore scroll position (logic in Task 2)
  }, [])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/viewer/PaginatedReading.tsx" @"
'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

interface PaginatedReadingProps {
  content: string
}

export function PaginatedReading({ content }: PaginatedReadingProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10 // Mock, real logic in Task 2

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center px-8">
          <div className="max-w-3xl w-full">
            <div
              className="prose prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/viewer/FontSizeControl.tsx" @"
'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

export function FontSizeControl() {
  const [fontSize, setFontSize] = useState(16)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFontSize(s => Math.max(12, s - 2))}
        disabled={fontSize <= 12}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
        {fontSize}px
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFontSize(s => Math.min(32, s + 2))}
        disabled={fontSize >= 32}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </div>
  )
}
"@

Create-Component "$baseDir/viewer/ThemeSwitch.tsx" @"
'use client'

import { useState, useEffect } from 'react'
import { Button } from '../common/Button'

export function ThemeSwitch() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Read from localStorage
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </Button>
  )
}
"@

Create-Component "$baseDir/viewer/ProgressBar.tsx" @"
'use client'

interface ProgressBarProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export function ProgressBar({ current, total, onChange }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="px-6 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="range"
            min="1"
            max={total}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 min-w-[4rem] text-right">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
"@

Create-Component "$baseDir/viewer/ReadingToolbar.tsx" @"
'use client'

import { FontSizeControl } from './FontSizeControl'
import { ThemeSwitch } from './ThemeSwitch'
import { AutoScrollToggle } from './AutoScrollToggle'
import { AutoPagingToggle } from './AutoPagingToggle'
import { Separator } from '../common/Separator'

export function ReadingToolbar() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FontSizeControl />
          <Separator orientation="vertical" className="h-6" />
          <ThemeSwitch />
        </div>
        <div className="flex items-center gap-3">
          <AutoScrollToggle />
          <AutoPagingToggle />
        </div>
      </div>
    </footer>
  )
}
"@

Create-Component "$baseDir/viewer/AutoScrollToggle.tsx" @"
'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

export function AutoScrollToggle() {
  const [isActive, setIsActive] = useState(false)

  return (
    <Button
      variant={isActive ? 'primary' : 'outline'}
      size="sm"
      onClick={() => setIsActive(!isActive)}
    >
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
      Auto Scroll
    </Button>
  )
}
"@

Create-Component "$baseDir/viewer/AutoPagingToggle.tsx" @"
'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

export function AutoPagingToggle() {
  const [isActive, setIsActive] = useState(false)

  return (
    <Button
      variant={isActive ? 'primary' : 'outline'}
      size="sm"
      onClick={() => setIsActive(!isActive)}
    >
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
      Auto Page
    </Button>
  )
}
"@

Write-Host "✓ Viewer module (11 files) created"

# TRANSLATION MODULE
Create-Component "$baseDir/translation/TranslationPanel.tsx" @"
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
          <ParagraphTranslation text="Sample paragraph..." translation="示例段落..." />
        </>
      )}
    </Card>
  )
}
"@

Create-Component "$baseDir/translation/TranslationLanguageSelector.tsx" @"
'use client'

interface TranslationLanguageSelectorProps {
  value: string
  onChange: (lang: string) => void
}

export function TranslationLanguageSelector({ value, onChange }: TranslationLanguageSelectorProps) {
  const languages = [
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Translate to:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
    </div>
  )
}
"@

Create-Component "$baseDir/translation/TranslationToggle.tsx" @"
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
"@

Create-Component "$baseDir/translation/ParagraphTranslation.tsx" @"
'use client'

interface ParagraphTranslationProps {
  text: string
  translation?: string
}

export function ParagraphTranslation({ text, translation }: ParagraphTranslationProps) {
  return (
    <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Original</p>
        <p className="text-slate-900 dark:text-slate-100">{text}</p>
      </div>
      {translation && (
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Translation</p>
          <p className="text-blue-600 dark:text-blue-400">{translation}</p>
        </div>
      )}
    </div>
  )
}
"@

Create-Component "$baseDir/translation/InlineTranslateButton.tsx" @"
'use client'

import { Button } from '../common/Button'

interface InlineTranslateButtonProps {
  onClick: () => void
  isLoading?: boolean
}

export function InlineTranslateButton({ onClick, isLoading }: InlineTranslateButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      isLoading={isLoading}
      className="absolute -top-8 right-0"
    >
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      Translate
    </Button>
  )
}
"@

Write-Host "✓ Translation module (5 files) created"

Write-Host "`n=== Component generation completed ===" -ForegroundColor Green
Write-Host "Next: Run remaining modules script..."
