/**
 * Cloud Sync Store
 * In-memory multi-device sync for demo mode
 * TODO: Replace with real database (PostgreSQL/MongoDB) in production
 */

/**
 * Reading progress for a book
 */
export interface ReadingProgress {
  userId: string
  bookId: string
  currentBlock: number
  scrollPosition: number
  timestamp: number
  deviceId: string
}

/**
 * User note/highlight
 */
export interface Note {
  id: string
  userId: string
  bookId: string
  blockIndex: number
  content: string
  type: 'note' | 'highlight'
  color?: string
  createdAt: number
  updatedAt: number
  deviceId: string
}

/**
 * User summary
 */
export interface UserSummary {
  id: string
  userId: string
  bookId: string
  content: string
  level: string
  createdAt: number
  updatedAt: number
  deviceId: string
}

/**
 * Flashcard progress
 */
export interface FlashcardProgress {
  userId: string
  bookId: string
  flashcardId: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: number
  lastReview: number
  deviceId: string
}

/**
 * Sync store class
 */
class SyncStore {
  private progress: Map<string, ReadingProgress> = new Map()
  private notes: Map<string, Note> = new Map()
  private summaries: Map<string, UserSummary> = new Map()
  private flashcards: Map<string, FlashcardProgress> = new Map()

  /**
   * Generate key for progress
   */
  private progressKey(userId: string, bookId: string): string {
    return `${userId}:${bookId}`
  }

  /**
   * Generate key for flashcard
   */
  private flashcardKey(userId: string, bookId: string, flashcardId: string): string {
    return `${userId}:${bookId}:${flashcardId}`
  }

  // ============================================
  // READING PROGRESS
  // ============================================

  /**
   * Save reading progress
   */
  saveProgress(progress: ReadingProgress): ReadingProgress {
    const key = this.progressKey(progress.userId, progress.bookId)
    this.progress.set(key, progress)
    return progress
  }

  /**
   * Get reading progress
   */
  getProgress(userId: string, bookId: string): ReadingProgress | null {
    const key = this.progressKey(userId, bookId)
    return this.progress.get(key) || null
  }

  /**
   * Get all progress for user
   */
  getUserProgress(userId: string): ReadingProgress[] {
    const results: ReadingProgress[] = []

    for (const [key, progress] of this.progress.entries()) {
      if (key.startsWith(`${userId}:`)) {
        results.push(progress)
      }
    }

    return results
  }

  // ============================================
  // NOTES AND HIGHLIGHTS
  // ============================================

  /**
   * Save note/highlight
   */
  saveNote(note: Note): Note {
    this.notes.set(note.id, note)
    return note
  }

  /**
   * Get note by ID
   */
  getNote(noteId: string): Note | null {
    return this.notes.get(noteId) || null
  }

  /**
   * Get all notes for a book
   */
  getBookNotes(userId: string, bookId: string): Note[] {
    const results: Note[] = []

    for (const note of this.notes.values()) {
      if (note.userId === userId && note.bookId === bookId) {
        results.push(note)
      }
    }

    return results.sort((a, b) => a.blockIndex - b.blockIndex)
  }

  /**
   * Get all notes for a user
   */
  getUserNotes(userId: string): Note[] {
    const results: Note[] = []

    for (const note of this.notes.values()) {
      if (note.userId === userId) {
        results.push(note)
      }
    }

    return results.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  /**
   * Update note
   */
  updateNote(noteId: string, content: string): Note | null {
    const note = this.notes.get(noteId)

    if (!note) {
      return null
    }

    note.content = content
    note.updatedAt = Date.now()

    return note
  }

  /**
   * Delete note
   */
  deleteNote(noteId: string): boolean {
    return this.notes.delete(noteId)
  }

  // ============================================
  // SUMMARIES
  // ============================================

  /**
   * Save summary
   */
  saveSummary(summary: UserSummary): UserSummary {
    this.summaries.set(summary.id, summary)
    return summary
  }

  /**
   * Get summary by ID
   */
  getSummary(summaryId: string): UserSummary | null {
    return this.summaries.get(summaryId) || null
  }

  /**
   * Get all summaries for a book
   */
  getBookSummaries(userId: string, bookId: string): UserSummary[] {
    const results: UserSummary[] = []

    for (const summary of this.summaries.values()) {
      if (summary.userId === userId && summary.bookId === bookId) {
        results.push(summary)
      }
    }

    return results.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Get all summaries for a user
   */
  getUserSummaries(userId: string): UserSummary[] {
    const results: UserSummary[] = []

    for (const summary of this.summaries.values()) {
      if (summary.userId === userId) {
        results.push(summary)
      }
    }

    return results.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * Delete summary
   */
  deleteSummary(summaryId: string): boolean {
    return this.summaries.delete(summaryId)
  }

  // ============================================
  // FLASHCARD PROGRESS
  // ============================================

  /**
   * Save flashcard progress
   */
  saveFlashcardProgress(progress: FlashcardProgress): FlashcardProgress {
    const key = this.flashcardKey(progress.userId, progress.bookId, progress.flashcardId)
    this.flashcards.set(key, progress)
    return progress
  }

  /**
   * Get flashcard progress
   */
  getFlashcardProgress(
    userId: string,
    bookId: string,
    flashcardId: string
  ): FlashcardProgress | null {
    const key = this.flashcardKey(userId, bookId, flashcardId)
    return this.flashcards.get(key) || null
  }

  /**
   * Get all flashcard progress for a book
   */
  getBookFlashcardProgress(userId: string, bookId: string): FlashcardProgress[] {
    const results: FlashcardProgress[] = []
    const prefix = `${userId}:${bookId}:`

    for (const [key, progress] of this.flashcards.entries()) {
      if (key.startsWith(prefix)) {
        results.push(progress)
      }
    }

    return results
  }

  /**
   * Get flashcards due for review
   */
  getDueFlashcards(userId: string, bookId: string): FlashcardProgress[] {
    const now = Date.now()
    const bookProgress = this.getBookFlashcardProgress(userId, bookId)

    return bookProgress.filter((p) => p.nextReview <= now)
  }

  // ============================================
  // SYNC UTILITIES
  // ============================================

  /**
   * Get last sync timestamp for user
   */
  getLastSync(userId: string): number {
    let lastSync = 0

    // Check progress
    for (const progress of this.progress.values()) {
      if (progress.userId === userId && progress.timestamp > lastSync) {
        lastSync = progress.timestamp
      }
    }

    // Check notes
    for (const note of this.notes.values()) {
      if (note.userId === userId && note.updatedAt > lastSync) {
        lastSync = note.updatedAt
      }
    }

    // Check summaries
    for (const summary of this.summaries.values()) {
      if (summary.userId === userId && summary.updatedAt > lastSync) {
        lastSync = summary.updatedAt
      }
    }

    return lastSync
  }

  /**
   * Get all data for user (for export)
   */
  getUserData(userId: string): {
    progress: ReadingProgress[]
    notes: Note[]
    summaries: UserSummary[]
    flashcards: FlashcardProgress[]
  } {
    return {
      progress: this.getUserProgress(userId),
      notes: this.getUserNotes(userId),
      summaries: this.getUserSummaries(userId),
      flashcards: Array.from(this.flashcards.values()).filter(
        (p) => p.userId === userId
      ),
    }
  }

  /**
   * Clear all data for user
   */
  clearUserData(userId: string): void {
    // Clear progress
    for (const [key, progress] of this.progress.entries()) {
      if (progress.userId === userId) {
        this.progress.delete(key)
      }
    }

    // Clear notes
    for (const [key, note] of this.notes.entries()) {
      if (note.userId === userId) {
        this.notes.delete(key)
      }
    }

    // Clear summaries
    for (const [key, summary] of this.summaries.entries()) {
      if (summary.userId === userId) {
        this.summaries.delete(key)
      }
    }

    // Clear flashcards
    for (const [key, flashcard] of this.flashcards.entries()) {
      if (flashcard.userId === userId) {
        this.flashcards.delete(key)
      }
    }
  }
}

// Global instance
let syncStore: SyncStore | null = null

/**
 * Get or create sync store instance
 */
export function getSyncStore(): SyncStore {
  if (!syncStore) {
    syncStore = new SyncStore()
  }

  return syncStore
}

/**
 * Reset sync store (for testing)
 */
export function resetSyncStore(): void {
  syncStore = null
}
