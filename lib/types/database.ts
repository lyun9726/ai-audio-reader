export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          owner_user_id: string
          title: string
          author: string | null
          description: string | null
          original_lang: string
          target_lang: string
          s3_original_url: string | null
          cover_url: string | null
          status: 'uploading' | 'processing' | 'translating' | 'generating_audio' | 'ready' | 'error'
          total_chapters: number
          total_paragraphs: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          title: string
          author?: string | null
          description?: string | null
          original_lang: string
          target_lang: string
          s3_original_url?: string | null
          cover_url?: string | null
          status?: 'uploading' | 'processing' | 'translating' | 'generating_audio' | 'ready' | 'error'
          total_chapters?: number
          total_paragraphs?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          title?: string
          author?: string | null
          description?: string | null
          original_lang?: string
          target_lang?: string
          s3_original_url?: string | null
          cover_url?: string | null
          status?: 'uploading' | 'processing' | 'translating' | 'generating_audio' | 'ready' | 'error'
          total_chapters?: number
          total_paragraphs?: number
          created_at?: string
          updated_at?: string
        }
      }
      book_paragraphs: {
        Row: {
          id: string
          book_id: string
          chapter: number
          para_idx: number
          text_original: string
          text_translated: string | null
          tokens: number | null
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          chapter: number
          para_idx: number
          text_original: string
          text_translated?: string | null
          tokens?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          chapter?: number
          para_idx?: number
          text_original?: string
          text_translated?: string | null
          tokens?: number | null
          created_at?: string
        }
      }
      book_audio_manifest: {
        Row: {
          id: string
          book_id: string
          para_idx: number
          audio_url: string
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          para_idx: number
          audio_url: string
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          para_idx?: number
          audio_url?: string
          duration?: number | null
          created_at?: string
        }
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          last_para_idx: number
          page: number | null
          play_pos_seconds: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          last_para_idx?: number
          page?: number | null
          play_pos_seconds?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          last_para_idx?: number
          page?: number | null
          play_pos_seconds?: number
          updated_at?: string
        }
      }
      summaries: {
        Row: {
          id: string
          user_id: string
          book_id: string
          scope: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          scope: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          scope?: string
          content?: string
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          type: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          meta_json: Json | null
          created_at: string
          finished_at: string | null
        }
        Insert: {
          id?: string
          type: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          meta_json?: Json | null
          created_at?: string
          finished_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          meta_json?: Json | null
          created_at?: string
          finished_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
