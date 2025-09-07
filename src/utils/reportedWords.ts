import type { ReportedWord, ReportedWordsHistory } from '@/typings'

const REPORTED_WORDS_KEY = 'qwerty_reported_words'

/**
 * Get reported words history from localStorage
 */
export function getReportedWordsHistory(): ReportedWordsHistory {
  try {
    const stored = localStorage.getItem(REPORTED_WORDS_KEY)
    if (!stored) {
      return { pending: [], submitted: [] }
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error parsing reported words from localStorage:', error)
    return { pending: [], submitted: [] }
  }
}

/**
 * Save reported words history to localStorage
 */
export function saveReportedWordsHistory(history: ReportedWordsHistory): void {
  try {
    localStorage.setItem(REPORTED_WORDS_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving reported words to localStorage:', error)
  }
}

/**
 * Add a new reported word to the pending list
 */
export function addReportedWord(reportedWord: ReportedWord): void {
  const history = getReportedWordsHistory()
  history.pending.push(reportedWord)
  saveReportedWordsHistory(history)
}

/**
 * Get the number of pending reported words
 */
export function getPendingReportedWordsCount(): number {
  const history = getReportedWordsHistory()
  return history.pending.length
}

/**
 * Move pending words to submitted and clear pending list
 * Returns the words that were submitted
 */
export function submitPendingWords(): ReportedWord[] {
  const history = getReportedWordsHistory()
  const wordsToSubmit = [...history.pending]

  if (wordsToSubmit.length > 0) {
    history.submitted.push(wordsToSubmit)
    history.pending = []
    saveReportedWordsHistory(history)
  }

  return wordsToSubmit
}

/**
 * Clear all reported words data
 */
export function clearReportedWordsHistory(): void {
  localStorage.removeItem(REPORTED_WORDS_KEY)
}

/**
 * Format reported words for Google Forms URL
 */
export function formatWordsForGoogleForm(words: ReportedWord[]): string {
  return words.map((word) => `${word.word}: ${word.originalTranslation} → ${word.userCorrection} (${word.dictionary})`).join('\n')
}

/**
 * Generate Google Forms URL with pre-filled reported words
 */
export function generateReportUrl(words: ReportedWord[]): string {
  const baseUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSdZSLMMw5lGL0NJb8bNeMsEwBQ0H3aEUkTtmt0cmVOV9c8QgA/viewform?usp=pp_url&entry.2064008161='
  const formattedWords = formatWordsForGoogleForm(words)
  return baseUrl + encodeURIComponent(formattedWords)
}
