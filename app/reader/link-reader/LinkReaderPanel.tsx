'use client'

import { useState } from 'react'
import { Card } from '../common/Card'
import { URLInputBox } from './URLInputBox'
import { FetchStatusIndicator } from './FetchStatusIndicator'
import { LinkReadingViewer } from './LinkReadingViewer'
import { Button } from '../common/Button'

export function LinkReaderPanel() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle')
  const [content, setContent] = useState('')

  const handleFetch = async () => {
    setStatus('fetching')
    setTimeout(() => {
      setContent('<h1>Article Title</h1><p>Article content goes here...</p>')
      setStatus('success')
    }, 2000)
  }

  return (
    <Card variant="bordered" className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Web Reader</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <URLInputBox value={url} onChange={setUrl} />
          <Button variant="primary" onClick={handleFetch} disabled={!url.trim()}>
            Fetch
          </Button>
        </div>
        <FetchStatusIndicator status={status} />
        {status === 'success' && <LinkReadingViewer content={content} />}
      </div>
    </Card>
  )
}
