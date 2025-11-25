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
