'use client'

import { useState } from 'react'
import { Button } from '../common/Button'

export function AutoPagingToggle() {
  const [isActive, setIsActive] = useState(false)

  return (
    <Button
      variant={isActive ? 'primary' : 'outline'}
      size="sm"
      onClick={() => setIsActive(!isActive)}
    >
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
      Auto Page
    </Button>
  )
}
