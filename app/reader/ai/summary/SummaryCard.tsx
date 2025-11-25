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
