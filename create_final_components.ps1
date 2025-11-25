# Part 3: AI modules (summary, mindmap, askbook) + Link-Reader
$baseDir = "d:/Users/Administrator/Desktop/ai-audio-reader/app/reader"

function Create-Component {
    param($path, $content)
    New-Item -Path $path -ItemType File -Force | Out-Null
    Set-Content -Path $path -Value $content -Encoding UTF8
}

# AI/SUMMARY MODULE (3 files)
Create-Component "$baseDir/ai/summary/DailySummaryPanel.tsx" @"
'use client'

import { useState } from 'react'
import { Card } from '../../common/Card'
import { SummaryCard } from './SummaryCard'
import { GenerateSummaryButton } from './GenerateSummaryButton'

export function DailySummaryPanel() {
  const [summaries, setSummaries] = useState<any[]>([])

  return (
    <Card variant="bordered" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Daily Reading Summary</h2>
        <GenerateSummaryButton onGenerate={() => {}} />
      </div>
      <div className="space-y-4">
        {summaries.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No summaries yet. Click generate to create one.</p>
        ) : (
          summaries.map((summary, i) => <SummaryCard key={i} summary={summary} />)
        )}
      </div>
    </Card>
  )
}
"@

Create-Component "$baseDir/ai/summary/SummaryCard.tsx" @"
'use client'

import { Card } from '../../common/Card'

interface Summary {
  date: string
  content: string
  keyPoints: string[]
}

export function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <Card variant="bordered" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{summary.date}</span>
      </div>
      <p className="text-slate-900 dark:text-slate-100 mb-4">{summary.content}</p>
      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Points:</h4>
          <ul className="list-disc list-inside space-y-1">
            {summary.keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-400">{point}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
"@

Create-Component "$baseDir/ai/summary/GenerateSummaryButton.tsx" @"
'use client'

import { Button } from '../../common/Button'

interface GenerateSummaryButtonProps {
  onGenerate: () => void
}

export function GenerateSummaryButton({ onGenerate }: GenerateSummaryButtonProps) {
  return (
    <Button variant="primary" size="sm" onClick={onGenerate}>
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Generate Summary
    </Button>
  )
}
"@

Write-Host "✓ AI/Summary module (3 files) created"

# AI/MINDMAP MODULE (4 files)
Create-Component "$baseDir/ai/mindmap/MindMapPanel.tsx" @"
'use client'

import { Card } from '../../common/Card'
import { GenerateMindMapButton } from './GenerateMindMapButton'
import { Node } from './Node'
import { Relation } from './Relation'

export function MindMapPanel() {
  const nodes = [
    { id: '1', label: 'Main Topic', x: 400, y: 200 },
    { id: '2', label: 'Subtopic 1', x: 200, y: 300 },
    { id: '3', label: 'Subtopic 2', x: 600, y: 300 },
  ]

  const relations = [
    { from: '1', to: '2' },
    { from: '1', to: '3' },
  ]

  return (
    <Card variant="bordered" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mind Map</h2>
        <GenerateMindMapButton onGenerate={() => {}} />
      </div>
      <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg" style={{ height: '500px' }}>
        <svg className="absolute inset-0 w-full h-full">
          {relations.map((rel, i) => {
            const fromNode = nodes.find(n => n.id === rel.from)
            const toNode = nodes.find(n => n.id === rel.to)
            return fromNode && toNode ? (
              <Relation key={i} from={fromNode} to={toNode} />
            ) : null
          })}
        </svg>
        {nodes.map(node => (
          <Node key={node.id} node={node} />
        ))}
      </div>
    </Card>
  )
}
"@

Create-Component "$baseDir/ai/mindmap/Node.tsx" @"
'use client'

interface NodeProps {
  node: { id: string; label: string; x: number; y: number }
}

export function Node({ node }: NodeProps) {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm"
      style={{ left: node.x, top: node.y }}
    >
      {node.label}
    </div>
  )
}
"@

Create-Component "$baseDir/ai/mindmap/Relation.tsx" @"
'use client'

interface RelationProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
}

export function Relation({ from, to }: RelationProps) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-300 dark:text-slate-600"
    />
  )
}
"@

Create-Component "$baseDir/ai/mindmap/GenerateMindMapButton.tsx" @"
'use client'

import { Button } from '../../common/Button'

interface GenerateMindMapButtonProps {
  onGenerate: () => void
}

export function GenerateMindMapButton({ onGenerate }: GenerateMindMapButtonProps) {
  return (
    <Button variant="primary" size="sm" onClick={onGenerate}>
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Generate Mind Map
    </Button>
  )
}
"@

Write-Host "✓ AI/MindMap module (4 files) created"

# AI/ASKBOOK MODULE (4 files)
Create-Component "$baseDir/ai/askbook/AskBookPanel.tsx" @"
'use client'

import { useState } from 'react'
import { Card } from '../../common/Card'
import { QuestionInput } from './QuestionInput'
import { AnswerBox } from './AnswerBox'
import { AskButton } from './AskButton'

export function AskBookPanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAsk = async () => {
    setIsLoading(true)
    // Mock response (real logic in Task 2)
    setTimeout(() => {
      setAnswer('This is a sample answer from the book context.')
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Card variant="bordered" className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Ask the Book</h2>
      <div className="space-y-4">
        <QuestionInput value={question} onChange={setQuestion} />
        <AskButton onClick={handleAsk} isLoading={isLoading} disabled={!question.trim()} />
        {answer && <AnswerBox answer={answer} />}
      </div>
    </Card>
  )
}
"@

Create-Component "$baseDir/ai/askbook/QuestionInput.tsx" @"
'use client'

interface QuestionInputProps {
  value: string
  onChange: (value: string) => void
}

export function QuestionInput({ value, onChange }: QuestionInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ask anything about this book..."
      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      rows={4}
    />
  )
}
"@

Create-Component "$baseDir/ai/askbook/AnswerBox.tsx" @"
'use client'

import { Card } from '../../common/Card'

interface AnswerBoxProps {
  answer: string
}

export function AnswerBox({ answer }: AnswerBoxProps) {
  return (
    <Card variant="bordered" className="p-4 bg-blue-50 dark:bg-blue-900/20">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-slate-900 dark:text-slate-100 flex-1">{answer}</p>
      </div>
    </Card>
  )
}
"@

Create-Component "$baseDir/ai/askbook/AskButton.tsx" @"
'use client'

import { Button } from '../../common/Button'

interface AskButtonProps {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function AskButton({ onClick, isLoading, disabled }: AskButtonProps) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
      className="w-full"
    >
      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      Ask Question
    </Button>
  )
}
"@

Write-Host "✓ AI/AskBook module (4 files) created"

# LINK-READER MODULE (4 files)
Create-Component "$baseDir/link-reader/LinkReaderPanel.tsx" @"
'use client'

import { useState } from 'react'
import { Card } from '../common/Card'
import { URLInputBox } from './URLInputBox'
import { FetchStatusIndicator } from './FetchStatusIndicator'
import { LinkReadingViewer } from './LinkReadingViewer'
import { Button } from '../common/Button'

export function LinkReaderPanel() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle')
  const [content, setContent] = useState('')

  const handleFetch = async () => {
    setStatus('fetching')
    // Mock fetch (real logic in Task 2)
    setTimeout(() => {
      setContent('<h1>Article Title</h1><p>Article content goes here...</p>')
      setStatus('success')
    }, 2000)
  }

  return (
    <Card variant="bordered" className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Web Reader</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <URLInputBox value={url} onChange={setUrl} />
          <Button variant="primary" onClick={handleFetch} disabled={!url.trim()}>
            Fetch
          </Button>
        </div>
        <FetchStatusIndicator status={status} />
        {status === 'success' && <LinkReadingViewer content={content} />}
      </div>
    </Card>
  )
}
"@

Create-Component "$baseDir/link-reader/URLInputBox.tsx" @"
'use client'

interface URLInputBoxProps {
  value: string
  onChange: (value: string) => void
}

export function URLInputBox({ value, onChange }: URLInputBoxProps) {
  return (
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="https://example.com/article"
      className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  )
}
"@

Create-Component "$baseDir/link-reader/FetchStatusIndicator.tsx" @"
'use client'

import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorBox } from '../common/ErrorBox'

interface FetchStatusIndicatorProps {
  status: 'idle' | 'fetching' | 'success' | 'error'
  error?: string
}

export function FetchStatusIndicator({ status, error }: FetchStatusIndicatorProps) {
  if (status === 'idle') return null

  if (status === 'fetching') {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-blue-700 dark:text-blue-300">Fetching article...</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <ErrorBox
        title="Fetch Failed"
        message={error || 'Failed to fetch the article. Please check the URL and try again.'}
      />
    )
  }

  return null
}
"@

Create-Component "$baseDir/link-reader/LinkReadingViewer.tsx" @"
'use client'

interface LinkReadingViewerProps {
  content: string
}

export function LinkReadingViewer({ content }: LinkReadingViewerProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
      <div
        className="prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
"@

Write-Host "✓ Link-Reader module (4 files) created"

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "✓✓✓ ALL UI COMPONENTS GENERATED SUCCESSFULLY ✓✓✓" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✓ Core layout (2 files)" -ForegroundColor Green
Write-Host "  ✓ Common components (10 files)" -ForegroundColor Green
Write-Host "  ✓ Upload module (5 files)" -ForegroundColor Green
Write-Host "  ✓ Library module (4 files)" -ForegroundColor Green
Write-Host "  ✓ Viewer module (11 files)" -ForegroundColor Green
Write-Host "  ✓ Translation module (5 files)" -ForegroundColor Green
Write-Host "  ✓ TTS module (8 files)" -ForegroundColor Green
Write-Host "  ✓ Languages module (2 files)" -ForegroundColor Green
Write-Host "  ✓ Voices module (4 files)" -ForegroundColor Green
Write-Host "  ✓ Settings module (5 files)" -ForegroundColor Green
Write-Host "  ✓ History module (3 files)" -ForegroundColor Green
Write-Host "  ✓ AI/Summary module (3 files)" -ForegroundColor Green
Write-Host "  ✓ AI/MindMap module (4 files)" -ForegroundColor Green
Write-Host "  ✓ AI/AskBook module (4 files)" -ForegroundColor Green
Write-Host "  ✓ Link-Reader module (4 files)" -ForegroundColor Green
Write-Host ""
Write-Host "Total: 74 component files created" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Run 'bash sync.sh' to push to GitHub" -ForegroundColor Yellow
