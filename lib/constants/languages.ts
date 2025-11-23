/**
 * 完整的语言列表 - 支持100+种语言
 */

export interface Language {
  code: string
  name: string
  nativeName: string
  category?: string
}

export const LANGUAGES: Language[] = [
  // 常用语言
  { code: 'en', name: 'English', nativeName: 'English', category: 'common' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文（简体）', category: 'common' },
  { code: 'zh-TW', name: 'Chinese (Traditional - Taiwan)', nativeName: '繁體中文（台灣）', category: 'common' },
  { code: 'zh-HK', name: 'Chinese (Traditional - Hong Kong)', nativeName: '繁體中文（香港）', category: 'common' },
  { code: 'yue', name: 'Cantonese', nativeName: '粤语', category: 'common' },
  { code: 'wuu', name: 'Classical Chinese', nativeName: '文言文', category: 'common' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', category: 'common' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', category: 'common' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', category: 'common' },
  { code: 'fr', name: 'French', nativeName: 'Français', category: 'common' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', category: 'common' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', category: 'common' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', category: 'common' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', category: 'common' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', category: 'common' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', category: 'common' },

  // A
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan dili' },

  // B
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ' },

  // C
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },

  // D
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },

  // E
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },

  // F
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fy', name: 'Frisian', nativeName: 'Frysk' },

  // G
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },

  // H
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hmn', name: 'Hmong', nativeName: 'Hmong' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },

  // I
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },

  // J
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa' },

  // K
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },

  // L
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'la', name: 'Latin', nativeName: 'Latina' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },

  // M
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'mi', name: 'Maori', nativeName: 'Māori' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },

  // N
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },

  // P
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },

  // R
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },

  // S
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa' },
  { code: 'gd', name: 'Scots Gaelic', nativeName: 'Gàidhlig' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },

  // T
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татарча' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད་' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
  { code: 'to', name: 'Tongan', nativeName: 'Lea Fakatonga' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe' },

  // U
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇرچە' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha' },

  // V
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },

  // W
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof' },

  // X
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },

  // Y
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'yua', name: 'Yucatec Maya', nativeName: 'Maaya' },

  // Z
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },

  // 特殊/构造语言
  { code: 'tlh', name: 'Klingon', nativeName: 'tlhIngan Hol', category: 'special' },
]

/**
 * 按类别分组的语言
 */
export const LANGUAGE_GROUPS = {
  common: LANGUAGES.filter(l => l.category === 'common'),
  all: LANGUAGES.filter(l => !l.category || l.category !== 'special'),
  special: LANGUAGES.filter(l => l.category === 'special'),
}

/**
 * 语言代码到名称的映射
 */
export const LANGUAGE_MAP = new Map(
  LANGUAGES.map(l => [l.code, l])
)

/**
 * 获取语言显示名称
 */
export function getLanguageName(code: string): string {
  const lang = LANGUAGE_MAP.get(code)
  return lang ? `${lang.name} (${lang.nativeName})` : code
}

/**
 * 搜索语言
 */
export function searchLanguages(query: string): Language[] {
  const lowerQuery = query.toLowerCase()
  return LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(lowerQuery) ||
      l.nativeName.toLowerCase().includes(lowerQuery) ||
      l.code.toLowerCase().includes(lowerQuery)
  )
}
