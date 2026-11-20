export function normalizeVoiceLanguage(language: string): string {
  return language.trim().toLowerCase().replace(/_/g, '-')
}

export function isCantoneseVoice(voice: Pick<SpeechSynthesisVoice, 'lang'>): boolean {
  const language = normalizeVoiceLanguage(voice.lang)

  return (
    language === 'yue' ||
    language.startsWith('yue-') ||
    language === 'zh-yue' ||
    language.startsWith('zh-yue-') ||
    language === 'zh-hk' ||
    language.startsWith('zh-hk-') ||
    language === 'zh-hant-hk' ||
    language.startsWith('zh-hant-hk-')
  )
}

export function getCantoneseVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.filter(isCantoneseVoice)
}
