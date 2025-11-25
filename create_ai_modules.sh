#!/bin/bash
BASE="./app/reader"

# AI/Summary
cat > "$BASE/ai/summary/DailySummaryPanel.tsx" << 'EOF'
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
EOF

cat > "$BASE/ai/summary/SummaryCard.tsx" << 'EOF'
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
EOF

cat > "$BASE/ai/summary/GenerateSummaryButton.tsx" << 'EOF'
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
EOF

echo "AI modules created successfully!"

