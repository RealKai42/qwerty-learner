export * from './statInfo'
export * from './resource'

export type PronunciationType = 'us' | 'uk' | 'romaji' | 'zh' | 'ja'
export type PhoneticType = 'us' | 'uk' | 'romaji' | 'zh' | 'ja'
export type LanguageType = 'en' | 'romaji' | 'zh' | 'ja'

export type Word = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
}

export type InfoPanelType = 'donate' | 'vsc' | 'community'

export type InfoPanelState = {
  [key in InfoPanelType]: boolean
}
