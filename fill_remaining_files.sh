#!/bin/bash
BASE="app/reader"

# MindMap
cat > "$BASE/ai/mindmap/Node.tsx" << 'EOF'
'use client'
interface NodeProps {
  node: { id: string; label: string; x: number; y: number }
}
export function Node({ node }: NodeProps) {
  return (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm" style={{ left: node.x, top: node.y }}>
      {node.label}
    </div>
  )
}
EOF

cat > "$BASE/ai/mindmap/Relation.tsx" << 'EOF'
'use client'
interface RelationProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
}
export function Relation({ from, to }: RelationProps) {
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-600" />
}
EOF

cat > "$BASE/ai/mindmap/GenerateMindMapButton.tsx" << 'EOF'
'use client'
import { Button } from '../../common/Button'
export function GenerateMindMapButton({ onGenerate }: { onGenerate: () => void }) {
  return (
    <Button variant="primary" size="sm" onClick={onGenerate}>
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Generate Mind Map
    </Button>
  )
}
EOF

# AskBook
cat > "$BASE/ai/askbook/QuestionInput.tsx" << 'EOF'
'use client'
export function QuestionInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Ask anything about this book..." className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" rows={4} />
}
EOF

cat > "$BASE/ai/askbook/AnswerBox.tsx" << 'EOF'
'use client'
import { Card } from '../../common/Card'
export function AnswerBox({ answer }: { answer: string }) {
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
EOF

cat > "$BASE/ai/askbook/AskButton.tsx" << 'EOF'
'use client'
import { Button } from '../../common/Button'
export function AskButton({ onClick, isLoading, disabled }: { onClick: () => void; isLoading?: boolean; disabled?: boolean }) {
  return (
    <Button variant="primary" onClick={onClick} isLoading={isLoading} disabled={disabled} className="w-full">
      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      Ask Question
    </Button>
  )
}
EOF

# Link Reader
cat > "$BASE/link-reader/URLInputBox.tsx" << 'EOF'
'use client'
export function URLInputBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://example.com/article" className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
}
EOF

cat > "$BASE/link-reader/FetchStatusIndicator.tsx" << 'EOF'
'use client'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorBox } from '../common/ErrorBox'
export function FetchStatusIndicator({ status, error }: { status: 'idle' | 'fetching' | 'success' | 'error'; error?: string }) {
  if (status === 'idle') return null
  if (status === 'fetching') return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-blue-700 dark:text-blue-300">Fetching article...</span>
    </div>
  )
  if (status === 'error') return <ErrorBox title="Fetch Failed" message={error || 'Failed to fetch the article.'} />
  return null
}
EOF

cat > "$BASE/link-reader/LinkReadingViewer.tsx" << 'EOF'
'use client'
export function LinkReadingViewer({ content }: { content: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
      <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
EOF

echo "✓ All remaining component files filled!"
