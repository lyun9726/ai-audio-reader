'use client'

/**
 * useTranslation Hook
 * Real-time translation for reader blocks
 */

import { useState, useCallback } from 'react'
import type { SupportedLanguage } from '@/lib/translation/translator'

export interface TranslationState {
  isLoading: boolean
  error: string | null
  currentLang: SupportedLanguage
  translations: Map<string, string>
}

export interface UseTranslationReturn {
  state: TranslationState
  translateText: (text: string) => Promise<string | null>
  setTargetLanguage: (lang: SupportedLanguage) => void
  clearTranslations: () => void
  isTranslated: (text: string) => boolean
  getTranslation: (text: string) => string | null
}

/**
 * useTranslation hook
 */
export function useTranslation(
  initialLang: SupportedLanguage = 'en'
): UseTranslationReturn {
  const [state, setState] = useState<TranslationState>({
    isLoading: false,
    error: null,
    currentLang: initialLang,
    translations: new Map(),
  })

  /**
   * Translate text
   */
  const translateText = useCallback(
    async (text: string): Promise<string | null> => {
      // Check cache first
      if (state.translations.has(text)) {
        return state.translations.get(text)!
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLang: state.currentLang,
          }),
        })

        if (!response.ok) {
          throw new Error(`Translation failed: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Translation failed')
        }

        // Cache the translation
        setState(prev => ({
          ...prev,
          isLoading: false,
          translations: new Map(prev.translations).set(text, data.translated),
        }))

        return data.translated
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
        return null
      }
    },
    [state.currentLang, state.translations]
  )

  /**
   * Set target language
   */
  const setTargetLanguage = useCallback((lang: SupportedLanguage) => {
    setState(prev => ({
      ...prev,
      currentLang: lang,
      translations: new Map(), // Clear cache when changing language
    }))
  }, [])

  /**
   * Clear all translations
   */
  const clearTranslations = useCallback(() => {
    setState(prev => ({
      ...prev,
      translations: new Map(),
    }))
  }, [])

  /**
   * Check if text is already translated
   */
  const isTranslated = useCallback(
    (text: string): boolean => {
      return state.translations.has(text)
    },
    [state.translations]
  )

  /**
   * Get cached translation
   */
  const getTranslation = useCallback(
    (text: string): string | null => {
      return state.translations.get(text) || null
    },
    [state.translations]
  )

  return {
    state,
    translateText,
    setTargetLanguage,
    clearTranslations,
    isTranslated,
    getTranslation,
  }
}
