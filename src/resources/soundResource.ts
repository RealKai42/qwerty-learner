import { SoundResource, LanguagePronunciationMap } from '@/typings'

export const SOUND_URL_PREFIX = REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner/sounds/' : './sounds/'

// will add more sound resource and add config ui in the future
const videoList = import.meta.glob(['/qwerty-learner/sounds/*.wav', '../../public/sounds/*.wav'], {
  eager: false,
})

export const keySoundResources: SoundResource[] = Object.keys(videoList)
  .map((k) => {
    const name = k.replace(/(.*\/)*([^.]+).*/gi, '$2')
    console.log('name: ', name)
    const suffix = k.substring(k.lastIndexOf('.'))
    console.log('suffix: ', suffix)
    console.log('filename: ', `${name}${suffix}`)
    return {
      key: name,
      name: `声音${name}`,
      filename: `${name}${suffix}`,
    }
  })
  .sort((a: SoundResource, b: SoundResource) => a.key.localeCompare(b.key))

// export const keySoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'click.wav' }]

export const wrongSoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'beep.wav' }]

export const correctSoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'correct.wav' }]

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
  code: {
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
  de: {
    defaultPronIndex: 0,
    pronunciation: [
      {
        name: '德语',
        pron: 'de',
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
