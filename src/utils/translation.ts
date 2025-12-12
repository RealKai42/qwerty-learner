import type { TranslationLanguageType, Word } from '@/typings'

/**
 * Get translation for a word in the specified language with backward compatibility
 * @param word - The word object
 * @param targetLang - The target translation language
 * @returns Array of translations or empty array if not available
 */
export function getWordTranslation(word: Word, targetLang: TranslationLanguageType): string[] {
  // Handle legacy format (string array)
  if (Array.isArray(word.trans)) {
    // Legacy format - assume Chinese
    return word.trans 
  }

  // Handle new multi-language format (Record<TranslationLanguageType, string[]>)
  if (typeof word.trans === 'object' && word.trans !== null) {
    return word.trans[targetLang] || []
  }

  return []
}

/**
 * Get formatted translation string for display
 * @param word - The word object
 * @param targetLang - The target translation language
 * @param fallbackMessage - Message to show when translation is not available
 * @returns Formatted translation string
 */
export function getFormattedTranslation(
  word: Word,
  targetLang: TranslationLanguageType,
  fallbackMessage: string = 'Translation not available',
): string {
  const translations = getWordTranslation(word, targetLang)

  if (translations.length === 0) {
    return fallbackMessage
  }

  return translations.join('；')
}
