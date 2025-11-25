'use client'

import { useRef } from 'react'
import { Button } from '../common/Button'

interface FilePickerProps {
  onFileSelect: (file: File) => void
}

export function FilePicker({ onFileSelect }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.epub,.txt,.mobi,.azw,.azw3,.fb2,.cbz,.cbr"
        onChange={handleChange}
        className="hidden"
      />
      <Button
        onClick={handleClick}
        variant="primary"
        size="lg"
        className="w-full"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Browse Files
      </Button>
    </>
  )
}
