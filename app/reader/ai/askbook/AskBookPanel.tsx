'use client'

import { useState } from 'react'
import { Card } from '../../common/Card'
import { QuestionInput } from './QuestionInput'
import { AnswerBox } from './AnswerBox'
import { AskButton } from './AskButton'

export function AskBookPanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAsk = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setAnswer('This is a sample answer from the book context.')
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Card variant="bordered" className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Ask the Book</h2>
      <div className="space-y-4">
        <QuestionInput value={question} onChange={setQuestion} />
        <AskButton onClick={handleAsk} isLoading={isLoading} disabled={!question.trim()} />
        {answer && <AnswerBox answer={answer} />}
      </div>
    </Card>
  )
}
