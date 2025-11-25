'use client'

import { useState } from 'react'
import { useReaderStore } from '../stores/readerStore'
import { useAI } from '../hooks/useAI'
import { SummaryCard } from './summary/SummaryCard'
import { GenerateSummaryButton } from './summary/GenerateSummaryButton'
import { AskBookPanel } from './askbook/AskBookPanel'
import { MindMapPanel } from './mindmap/MindMapPanel'
import { ExplainPanel } from './explain/ExplainPanel'
import { Card } from '../common/Card'

type AITab = 'summary' | 'qa' | 'mindmap' | 'explain'

export function AISidebar() {
  const [activeTab, setActiveTab] = useState<AITab>('summary')
  const blocks = useReaderStore(state => state.blocks)

  const {
    summary,
    generateSummary,
    isLoading,
    error,
  } = useAI()

  const handleGenerateSummary = async () => {
    await generateSummary(blocks)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'summary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'qa'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Q&A
        </button>
        <button
          onClick={() => setActiveTab('mindmap')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'mindmap'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Mindmap
        </button>
        <button
          onClick={() => setActiveTab('explain')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'explain'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Explain
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <Card variant="outlined" className="p-4 mb-4 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            <GenerateSummaryButton onGenerate={handleGenerateSummary} />
            {isLoading && (
              <Card variant="bordered" className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Generating summary...</p>
              </Card>
            )}
            {summary && (
              <SummaryCard
                summary={{
                  date: new Date().toLocaleDateString(),
                  content: summary.summary,
                  keyPoints: summary.keyPoints,
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'qa' && <AskBookPanel />}

        {activeTab === 'mindmap' && <MindMapPanel />}

        {activeTab === 'explain' && <ExplainPanel />}
      </div>
    </div>
  )
}
