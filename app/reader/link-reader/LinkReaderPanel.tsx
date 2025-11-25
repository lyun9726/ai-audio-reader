'use client'

import { useState } from 'react'
import { Card } from '../common/Card'
import { URLInputBox } from './URLInputBox'
import { FetchStatusIndicator } from './FetchStatusIndicator'
import { LinkReadingViewer } from './LinkReadingViewer'
import { Button } from '../common/Button'
import { useReaderStore } from '../stores/readerStore'

export function LinkReaderPanel() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const setBook = useReaderStore(state => state.setBook)

  const handleFetch = async () => {
    setStatus('fetching')
    setError('')

    try {
      const response = await fetch('/api/ingest/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          previewOnly: false,
          previewTranslated: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      // Load into reader store
      setBook('url-' + Date.now(), data.title, data.blocks)

      // Display HTML content
      const htmlContent = data.blocks.map((b: any) => `<p>${b.text}</p>`).join('\n')
      setContent(htmlContent)

      setStatus('success')
    } catch (err: any) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <Card variant="bordered" className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Web Reader</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <URLInputBox value={url} onChange={setUrl} />
          <Button variant="primary" onClick={handleFetch} disabled={!url.trim() || status === 'fetching'}>
            {status === 'fetching' ? 'Fetching...' : 'Fetch'}
          </Button>
        </div>
        <FetchStatusIndicator status={status} error={error} />
        {status === 'success' && <LinkReadingViewer content={content} />}
      </div>
    </Card>
  )
}
