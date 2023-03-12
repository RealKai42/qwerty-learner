export type SoundResource = {
  key: string
  name: string
  filename: string
}

export type PronunciationType = 'us' | 'uk' | 'romaji' | 'zh' | 'ja'
export type PhoneticType = 'us' | 'uk' | 'romaji' | 'zh' | 'ja'
export type LanguageType = 'en' | 'romaji' | 'zh' | 'ja'

export type Word = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
}
