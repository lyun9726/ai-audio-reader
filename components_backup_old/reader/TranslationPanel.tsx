'use client'

/**
 * Translation Panel Component
 * Displays translations in bilingual mode or separate panel
 */

import { useEffect } from 'react'
import { useTranslation, type UseTranslationReturn } from '@/app/reader/hooks/useTranslation'
import { LANGUAGE_NAMES, type SupportedLanguage } from '@/lib/translation/translator'

export interface TranslationPanelProps {
  text: string
  mode?: 'bilingual' | 'separate'
  autoTranslate?: boolean
  onTranslated?: (translated: string) => void
}

export function TranslationPanel({
  text,
  mode = 'separate',
  autoTranslate = true,
  onTranslated,
}: TranslationPanelProps) {
  const { state, translateText, setTargetLanguage, getTranslation } = useTranslation()

  // Auto-translate when text changes
  useEffect(() => {
    if (autoTranslate && text && !getTranslation(text)) {
      translateText(text).then(translated => {
        if (translated && onTranslated) {
          onTranslated(translated)
        }
      })
    }
  }, [text, autoTranslate, translateText, getTranslation, onTranslated])

  const translation = getTranslation(text)

  if (mode === 'bilingual') {
    return (
      <div className="space-y-4">
        {/* Language Selector */}
        <LanguageSelector
          currentLang={state.currentLang}
          onLanguageChange={setTargetLanguage}
        />

        {/* Bilingual Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original Text */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Original
            </h3>
            <p className="text-gray-900">{text}</p>
          </div>

          {/* Translated Text */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">
              {LANGUAGE_NAMES[state.currentLang]}
            </h3>
            {state.isLoading ? (
              <p className="text-blue-600 animate-pulse">Translating...</p>
            ) : translation ? (
              <p className="text-gray-900">{translation}</p>
            ) : state.error ? (
              <p className="text-red-600">{state.error}</p>
            ) : (
              <p className="text-gray-400">No translation yet</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Separate panel mode
  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <LanguageSelector
        currentLang={state.currentLang}
        onLanguageChange={setTargetLanguage}
      />

      {/* Translation Display */}
      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Translation ({LANGUAGE_NAMES[state.currentLang]})
          </h3>
          {state.isLoading && (
            <span className="text-xs text-blue-600 animate-pulse">
              Translating...
            </span>
          )}
        </div>

        {translation ? (
          <p className="text-gray-900 leading-relaxed">{translation}</p>
        ) : state.error ? (
          <p className="text-red-600 text-sm">{state.error}</p>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Translation will appear here...
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Language Selector Component
 */
interface LanguageSelectorProps {
  currentLang: SupportedLanguage
  onLanguageChange: (lang: SupportedLanguage) => void
}

function LanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
  const languages: SupportedLanguage[] = ['zh', 'en', 'jp', 'es', 'fr']

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700">
        Target Language:
      </label>
      <select
        value={currentLang}
        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_NAMES[lang]}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Inline Translation Component (for embedding in reader blocks)
 */
export interface InlineTranslationProps {
  originalText: string
  translatedText?: string
  isLoading?: boolean
}

export function InlineTranslation({
  originalText,
  translatedText,
  isLoading,
}: InlineTranslationProps) {
  return (
    <div className="space-y-2 my-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
      <p className="text-gray-900">{originalText}</p>
      <div className="pt-2 border-t border-blue-200">
        {isLoading ? (
          <p className="text-blue-600 text-sm animate-pulse">Translating...</p>
        ) : translatedText ? (
          <p className="text-blue-900 text-sm italic">{translatedText}</p>
        ) : null}
      </div>
    </div>
  )
}
