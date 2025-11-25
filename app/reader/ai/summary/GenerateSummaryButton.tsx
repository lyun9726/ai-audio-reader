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
