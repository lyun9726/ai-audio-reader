/**
 * Language and TTS Voice Configuration
 * Used for translation language selection and TTS voice presets
 */

// Translation languages
export const languages = [
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'en', name: 'English' },
  { code: 'jp', name: '日本語 (Japanese)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
]

// TTS voice presets
export const ttsPresets = [
  { id: 'default', name: 'Default Voice' },
  { id: 'alloy', name: 'Alloy (Neutral)' },
  { id: 'echo', name: 'Echo (Male)' },
  { id: 'fable', name: 'Fable (British Male)' },
  { id: 'onyx', name: 'Onyx (Deep Male)' },
  { id: 'nova', name: 'Nova (Female)' },
  { id: 'shimmer', name: 'Shimmer (Female)' },
]
