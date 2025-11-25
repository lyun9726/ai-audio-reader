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
