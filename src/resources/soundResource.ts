import { SoundResource, PronunciationType, LanguageType } from '@/typings'

export const SOUND_URL_PREFIX = './sounds/'

// will add more sound resource and add config ui in the future
export const keySoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'click.wav' }]

export const wrongSoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'beep.wav' }]

export const correctSoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'correct.wav' }]

export type PronunciationConfig = {
  name: string
  pron: PronunciationType
}

export type LanguagePronunciationMapConfig = {
  defaultPronIndex: number
  pronunciation: PronunciationConfig[]
}

export type LanguagePronunciationMap = {
  [key in LanguageType]: LanguagePronunciationMapConfig
}

export const LANG_PRON_MAP: LanguagePronunciationMap = {
  en: {
    defaultPronIndex: 0,
    pronunciation: [
      {
        name: '美音',
        pron: 'us',
      },
      {
        name: '英音',
        pron: 'uk',
      },
    ],
  },
  romaji: {
    defaultPronIndex: 0,
    pronunciation: [
      {
        name: '罗马音',
        pron: 'romaji',
      },
    ],
  },
  zh: {
    defaultPronIndex: 0,
    pronunciation: [
      {
        name: '普通话',
        pron: 'zh',
      },
    ],
  },
  ja: {
    defaultPronIndex: 0,
    pronunciation: [
      {
        name: '日语',
        pron: 'ja',
      },
    ],
  },
}
