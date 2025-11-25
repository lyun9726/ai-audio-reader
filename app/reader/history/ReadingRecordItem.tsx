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
