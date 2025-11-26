/**
 * Quiz Generator
 * Generates quizzes with multiple choice, cloze, and short answer questions
 */

import type { ReaderBlock } from '@/lib/types'

/**
 * Quiz types
 */
export type QuizType = 'mcq' | 'cloze' | 'shortAnswer'

/**
 * Quiz item structure
 */
export interface QuizItem {
  id: string
  type: QuizType
  question: string
  options?: string[]
  answer: string
  explanation: string
  difficulty?: 'easy' | 'medium' | 'hard'
  blockId?: string
}

/**
 * Generate quiz items from blocks
 */
export async function generateQuiz(
  blocks: ReaderBlock[],
  quizType: QuizType = 'mcq',
  count: number = 10,
  useLLM: boolean = false
): Promise<QuizItem[]> {
  if (useLLM) {
    // TODO: Integrate with actual LLM when API key is available
    return generateMockQuiz(blocks, quizType, count)
  }

  return generateMockQuiz(blocks, quizType, count)
}

/**
 * Generate deterministic mock quiz
 */
function generateMockQuiz(
  blocks: ReaderBlock[],
  quizType: QuizType,
  count: number
): QuizItem[] {
  const textBlocks = blocks.filter(b => b.type === 'paragraph' && b.text)
  const items: QuizItem[] = []

  for (let i = 0; i < Math.min(count, textBlocks.length * 2); i++) {
    const blockIndex = i % textBlocks.length
    const block = textBlocks[blockIndex]

    if (!block.text) continue

    let item: QuizItem

    switch (quizType) {
      case 'mcq':
        item = generateMCQItem(block, i)
        break
      case 'cloze':
        item = generateClozeItem(block, i)
        break
      case 'shortAnswer':
        item = generateShortAnswerItem(block, i)
        break
      default:
        item = generateMCQItem(block, i)
    }

    items.push(item)
  }

  return items.slice(0, count)
}

/**
 * Generate multiple choice question
 */
function generateMCQItem(block: ReaderBlock, index: number): QuizItem {
  const sentences = block.text!.split(/[.!?]/).filter(s => s.trim().length > 20)
  const sentence = sentences[index % sentences.length] || sentences[0]

  // Extract key term (first significant word)
  const words = sentence.trim().split(/\s+/)
  const keyWord = words.find(w => w.length > 5) || words[0]

  const options = [
    keyWord,
    `alternative-${index}-1`,
    `alternative-${index}-2`,
    `alternative-${index}-3`,
  ].sort(() => Math.random() - 0.5)

  return {
    id: `quiz-mcq-${index}`,
    type: 'mcq',
    question: `DEMO: What is the key concept mentioned in: "${sentence.substring(0, 80)}..."?`,
    options,
    answer: keyWord,
    explanation: `DEMO: The correct answer is "${keyWord}" as mentioned in the text.`,
    difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
    blockId: block.id,
  }
}

/**
 * Generate cloze (fill-in-the-blank) question
 */
function generateClozeItem(block: ReaderBlock, index: number): QuizItem {
  const sentences = block.text!.split(/[.!?]/).filter(s => s.trim().length > 20)
  const sentence = sentences[index % sentences.length] || sentences[0]

  const words = sentence.trim().split(/\s+/)
  const blankIndex = Math.floor(words.length / 2)
  const answer = words[blankIndex]

  const clozeSentence = [
    ...words.slice(0, blankIndex),
    '______',
    ...words.slice(blankIndex + 1),
  ].join(' ')

  return {
    id: `quiz-cloze-${index}`,
    type: 'cloze',
    question: `DEMO: Fill in the blank: ${clozeSentence}`,
    answer,
    explanation: `DEMO: The missing word is "${answer}".`,
    difficulty: 'medium',
    blockId: block.id,
  }
}

/**
 * Generate short answer question
 */
function generateShortAnswerItem(block: ReaderBlock, index: number): QuizItem {
  const sentences = block.text!.split(/[.!?]/).filter(s => s.trim().length > 20)
  const sentence = sentences[index % sentences.length] || sentences[0]

  const question = `DEMO: Explain the concept mentioned in this passage: "${sentence.substring(0, 60)}..."`

  return {
    id: `quiz-short-${index}`,
    type: 'shortAnswer',
    question,
    answer: sentence.substring(0, 100),
    explanation: `DEMO: A good answer should mention the key concepts from the passage.`,
    difficulty: 'hard',
    blockId: block.id,
  }
}

/**
 * Validate quiz answer
 */
export function validateAnswer(item: QuizItem, userAnswer: string): boolean {
  const normalizedAnswer = item.answer.toLowerCase().trim()
  const normalizedUserAnswer = userAnswer.toLowerCase().trim()

  if (item.type === 'mcq' || item.type === 'cloze') {
    return normalizedAnswer === normalizedUserAnswer
  }

  // For short answer, check if user answer contains key terms
  const keyTerms = normalizedAnswer.split(/\s+/).filter(w => w.length > 3)
  const matchCount = keyTerms.filter(term =>
    normalizedUserAnswer.includes(term)
  ).length

  return matchCount >= Math.ceil(keyTerms.length / 2)
}

/**
 * Calculate quiz score
 */
export function calculateScore(
  items: QuizItem[],
  userAnswers: Record<string, string>
): {
  score: number
  total: number
  percentage: number
  correct: string[]
  incorrect: string[]
} {
  let correct = 0
  const correctIds: string[] = []
  const incorrectIds: string[] = []

  items.forEach(item => {
    const userAnswer = userAnswers[item.id]
    if (userAnswer && validateAnswer(item, userAnswer)) {
      correct++
      correctIds.push(item.id)
    } else {
      incorrectIds.push(item.id)
    }
  })

  return {
    score: correct,
    total: items.length,
    percentage: Math.round((correct / items.length) * 100),
    correct: correctIds,
    incorrect: incorrectIds,
  }
}
