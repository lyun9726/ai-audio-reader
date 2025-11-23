/**
 * 句子分割工具
 * 将段落按句子拆分，支持多语言
 */

export interface Sentence {
  text: string
  index: number
}

/**
 * 智能句子分割
 * 支持英文、中文等多种语言
 */
export function splitIntoSentences(text: string, lang: string = 'en'): Sentence[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const sentences: Sentence[] = []

  if (lang === 'zh' || lang.startsWith('zh-')) {
    // 中文句子分割
    return splitChineseSentences(text)
  } else {
    // 英文及其他语言句子分割
    return splitEnglishSentences(text)
  }
}

/**
 * 英文句子分割
 * 处理各种边界情况
 */
function splitEnglishSentences(text: string): Sentence[] {
  const sentences: Sentence[] = []

  // 预处理：保护常见缩写
  let processed = text
    .replace(/Mr\./g, 'Mr<DOT>')
    .replace(/Mrs\./g, 'Mrs<DOT>')
    .replace(/Ms\./g, 'Ms<DOT>')
    .replace(/Dr\./g, 'Dr<DOT>')
    .replace(/Prof\./g, 'Prof<DOT>')
    .replace(/Sr\./g, 'Sr<DOT>')
    .replace(/Jr\./g, 'Jr<DOT>')
    .replace(/vs\./g, 'vs<DOT>')
    .replace(/etc\./g, 'etc<DOT>')
    .replace(/e\.g\./g, 'e<DOT>g<DOT>')
    .replace(/i\.e\./g, 'i<DOT>e<DOT>')
    .replace(/([A-Z])\./g, '$1<DOT>') // 大写字母缩写 (U.S.A.)
    .replace(/(\d+)\./g, '$1<DOT>') // 数字后的点 (3.14)

  // 按句子终止符分割
  // 匹配: . ! ? 后面跟空格或换行或引号
  const sentenceRegex = /([.!?]+)(\s+|$|["'])/g

  let lastIndex = 0
  let match

  while ((match = sentenceRegex.exec(processed)) !== null) {
    const endIndex = match.index + match[1].length
    const sentence = processed.substring(lastIndex, endIndex).trim()

    if (sentence.length > 0) {
      // 恢复原始的点
      const restored = sentence.replace(/<DOT>/g, '.')

      // 过滤掉太短的句子（可能是误判）
      if (restored.length > 3) {
        sentences.push({
          text: restored,
          index: sentences.length
        })
      }
    }

    lastIndex = match.index + match[0].length
  }

  // 处理最后一个句子（如果没有终止符）
  if (lastIndex < processed.length) {
    const lastSentence = processed.substring(lastIndex).trim().replace(/<DOT>/g, '.')
    if (lastSentence.length > 3) {
      sentences.push({
        text: lastSentence,
        index: sentences.length
      })
    }
  }

  // 如果没有分割出任何句子，返回整个段落
  if (sentences.length === 0) {
    return [{
      text: text.trim(),
      index: 0
    }]
  }

  return sentences
}

/**
 * 中文句子分割
 */
function splitChineseSentences(text: string): Sentence[] {
  const sentences: Sentence[] = []

  // 中文句子终止符：。！？；
  const sentenceRegex = /[^。！？；]+[。！？；]/g
  const matches = text.match(sentenceRegex)

  if (matches) {
    matches.forEach((sentence, index) => {
      const trimmed = sentence.trim()
      if (trimmed.length > 0) {
        sentences.push({
          text: trimmed,
          index
        })
      }
    })
  }

  // 如果没有分割出句子，返回整个段落
  if (sentences.length === 0) {
    return [{
      text: text.trim(),
      index: 0
    }]
  }

  return sentences
}

/**
 * 批量分割段落为句子
 */
export function splitParagraphsIntoSentences(
  paragraphs: string[],
  lang: string = 'en'
): Array<{ paraIdx: number; sentences: Sentence[] }> {
  return paragraphs.map((para, paraIdx) => ({
    paraIdx,
    sentences: splitIntoSentences(para, lang)
  }))
}

/**
 * 估算分割后的句子总数
 */
export function estimateSentenceCount(text: string, lang: string = 'en'): number {
  if (lang === 'zh' || lang.startsWith('zh-')) {
    // 中文：按句号等计数
    const matches = text.match(/[。！？；]/g)
    return matches ? matches.length : 1
  } else {
    // 英文：按句点、感叹号、问号计数
    const matches = text.match(/[.!?]+/g)
    return matches ? matches.length : 1
  }
}

/**
 * 验证句子对是否对齐
 */
export function validateSentencePairs(
  originalSentences: Sentence[],
  translatedSentences: Sentence[]
): boolean {
  return originalSentences.length === translatedSentences.length
}
