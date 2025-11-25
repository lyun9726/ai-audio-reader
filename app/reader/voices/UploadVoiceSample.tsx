'use client'

import { useRef } from 'react'
import { Button } from '../common/Button'

export function UploadVoiceSample() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
      />
      <Button
        variant="primary"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Upload Voice
      </Button>
    </>
  )
}
