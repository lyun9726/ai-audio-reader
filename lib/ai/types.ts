import type { ReaderBlock } from '../types'

export interface AIRequest {
  bookId?: string
  blocks: ReaderBlock[]
  userSelection?: string
  question?: string
  context?: string
}

export interface SummaryResponse {
  summary: string
  keyPoints: string[]
  mainIdea: string
}

export interface QAMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface QAResponse {
  answer: string
  conversationId?: string
}

export interface MindmapNode {
  title: string
  children?: MindmapNode[]
}

export interface MindmapResponse {
  title: string
  nodes: MindmapNode[]
}

export interface ExplainResponse {
  explanation: string
  examples?: string[]
  relatedConcepts?: string[]
}
