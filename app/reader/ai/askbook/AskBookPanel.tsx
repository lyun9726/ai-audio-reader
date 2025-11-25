'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../common/Card'
import { QuestionInput } from './QuestionInput'
import { AnswerBox } from './AnswerBox'
import { AskButton } from './AskButton'
import { useReaderStore } from '../../stores/readerStore'
import { useAI } from '../../hooks/useAI'

export function AskBookPanel() {
  const [question, setQuestion] = useState('')
  const blocks = useReaderStore(state => state.blocks)

  const {
    qaMessages,
    streamingAnswer,
    askQuestion,
    isStreaming,
  } = useAI()

  const handleAsk = async () => {
    if (!question.trim()) return
    await askQuestion(blocks, question)
    setQuestion('')
  }

  return (
    <Card variant="bordered" className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Ask the Book</h2>

      {/* Conversation History */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {qaMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                : 'bg-slate-50 dark:bg-slate-900 mr-8'
            }`}
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </p>
            <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {/* Streaming Answer */}
        {streamingAnswer && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 mr-8">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assistant</p>
            <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{streamingAnswer}</p>
            <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="space-y-4">
        <QuestionInput value={question} onChange={setQuestion} />
        <AskButton onClick={handleAsk} isLoading={isStreaming} disabled={!question.trim() || isStreaming} />
      </div>
    </Card>
  )
}
