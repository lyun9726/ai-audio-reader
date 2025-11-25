#!/bin/bash
# Bind UI components to ReaderStore

BASE="app/reader"

# Update LinkReaderPanel with real API integration
cat > "$BASE/link-reader/LinkReaderPanel.tsx" << 'EOF'
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
EOF

# Update SpeedControl to use readerStore
cat > "$BASE/tts/SpeedControl.tsx" << 'EOF'
'use client'

import { useReaderStore } from '../stores/readerStore'

export function SpeedControl() {
  const rate = useReaderStore(state => state.tts.rate)
  const setRate = useReaderStore(state => state.setRate)

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Speed</label>
        <span className="text-sm text-slate-500">{rate.toFixed(1)}x</span>
      </div>
      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.1"
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}
EOF

# Update PitchControl
cat > "$BASE/tts/PitchControl.tsx" << 'EOF'
'use client'

import { useReaderStore } from '../stores/readerStore'

export function PitchControl() {
  const pitch = useReaderStore(state => state.tts.pitch)
  const setPitch = useReaderStore(state => state.setPitch)

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pitch</label>
        <span className="text-sm text-slate-500">{pitch.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.1"
        value={pitch}
        onChange={(e) => setPitch(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}
EOF

# Update PlayButton
cat > "$BASE/tts/PlayButton.tsx" << 'EOF'
'use client'

import { Button } from '../common/Button'
import { useReaderStore } from '../stores/readerStore'

export function PlayButton() {
  const isPlaying = useReaderStore(state => state.tts.isPlaying)
  const play = useReaderStore(state => state.play)
  const pause = useReaderStore(state => state.pause)

  const handleToggle = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  return (
    <Button variant="primary" className="flex-1" onClick={handleToggle}>
      {isPlaying ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )}
    </Button>
  )
}
EOF

# Update TranslationToggle
cat > "$BASE/translation/TranslationToggle.tsx" << 'EOF'
'use client'

import { useReaderStore } from '../stores/readerStore'

export function TranslationToggle() {
  const enabled = useReaderStore(state => state.translation.enabled)
  const setTranslationEnabled = useReaderStore(state => state.setTranslationEnabled)

  return (
    <button
      onClick={() => setTranslationEnabled(!enabled)}
      className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' +
        (enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600')}
    >
      <span
        className={'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' +
          (enabled ? 'translate-x-6' : 'translate-x-1')}
      />
    </button>
  )
}
EOF

# Update ScrollReading to use ReaderStore
cat > "$BASE/viewer/ScrollReading.tsx" << 'EOF'
'use client'

import { useEffect, useRef } from 'react'
import { useReaderStore } from '../stores/readerStore'

export function ScrollReading() {
  const containerRef = useRef<HTMLDivElement>(null)
  const blocks = useReaderStore(state => state.blocks)
  const translationEnabled = useReaderStore(state => state.translation.enabled)
  const translatedBlocks = useReaderStore(state => state.translation.translatedBlocks)

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {blocks.map((block) => (
            <div key={block.id} className="mb-6">
              <p className="text-slate-900 dark:text-slate-100">{block.text}</p>
              {translationEnabled && translatedBlocks.has(block.id) && (
                <p className="mt-2 text-blue-600 dark:text-blue-400 text-sm">
                  {translatedBlocks.get(block.id)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
EOF

echo "✓ All key components updated and bound to ReaderStore"
EOF

chmod +x bind_components.sh
bash bind_components.sh
