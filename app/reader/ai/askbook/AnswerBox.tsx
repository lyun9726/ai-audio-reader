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
