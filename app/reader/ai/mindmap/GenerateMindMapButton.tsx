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
