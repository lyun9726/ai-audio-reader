'use client'

import { Button } from '../common/Button'

export function ClearHistoryButton() {
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all reading history?')) {
      // Logic in Task 2
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClear}>
      Clear All
    </Button>
  )
}
