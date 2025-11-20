import { Database } from './database'

export type Book = Database['public']['Tables']['books']['Row']
export type BookInsert = Database['public']['Tables']['books']['Insert']
export type BookUpdate = Database['public']['Tables']['books']['Update']

export type BookParagraph = Database['public']['Tables']['book_paragraphs']['Row']
export type BookParagraphInsert = Database['public']['Tables']['book_paragraphs']['Insert']

export type AudioManifest = Database['public']['Tables']['book_audio_manifest']['Row']
export type AudioManifestInsert = Database['public']['Tables']['book_audio_manifest']['Insert']

export type ReadingProgress = Database['public']['Tables']['reading_progress']['Row']
export type ReadingProgressUpdate = Database['public']['Tables']['reading_progress']['Update']

export type Summary = Database['public']['Tables']['summaries']['Row']
export type SummaryInsert = Database['public']['Tables']['summaries']['Insert']

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']

export interface UploadBookRequest {
  title: string
  author?: string
  description?: string
  source_lang: string
  target_lang: string
  file: File
}

export interface TranslateRequest {
  bookId: string
  targetLang: string
}

export interface TTSRequest {
  bookId: string
  voice?: string
  speed?: number
}

export interface ProgressUpdateRequest {
  bookId: string
  paraIdx: number
  page?: number
  playPosSeconds: number
}

export interface SummaryRequest {
  bookId: string
  scope: 'today' | 'chapter' | 'range'
  fromPara?: number
  toPara?: number
}
