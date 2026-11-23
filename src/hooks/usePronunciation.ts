import { pronunciationConfigAtom } from '@/store'
import type { PronunciationType } from '@/typings'
import { addHowlListener } from '@/utils'
import { romajiToHiragana } from '@/utils/kana'
import noop from '@/utils/noop'
import type { Howl } from 'howler'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import useSound from 'use-sound'
import type { HookOptions } from 'use-sound/dist/types'

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

// Youdao returns HTTP 500 for parentheses, quotation marks, and an encoded "&".
// Apostrophes inside a word, as in "don't", still pronounce.
function spokenWord(word: string): string {
  const withoutAmpersand = word.replace(/&/g, ' and ')
  const withoutMarks = withoutAmpersand.replace(/[()（）「」"“”]/g, '')
  const withoutLooseQuotes = withoutMarks.replace(/['‘’]+/g, (marks, offset, text) => {
    const before = text[offset - 1] ?? ''
    const after = text[offset + marks.length] ?? ''
    if (/[A-Za-z]/.test(before) && /[A-Za-z]/.test(after)) return marks
    return ''
  })
  return withoutLooseQuotes.replace(/\s+/g, ' ').trim()
}

export function generateWordSoundSrc(word: string, pronunciation: Exclude<PronunciationType, false>): string {
  // Youdao rejects a slash. television/TV and aus/sprechen both 500.
  // Read the first spelling. The headword on screen is unchanged.
  const source = word.split('/')[0]
  const cleaned = spokenWord(source)
  if (!cleaned) return ''
  const spoken = pronunciation === 'romaji' ? romajiToHiragana(cleaned) : cleaned

  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${spoken}&type=1`
    case 'us':
      return `${pronunciationApi}${spoken}&type=2`
    case 'romaji':
      return `${pronunciationApi}${spoken}&le=jap`
    case 'zh':
      return `${pronunciationApi}${spoken}&le=zh`
    case 'ja':
      return `${pronunciationApi}${spoken}&le=jap`
    case 'de':
      return `${pronunciationApi}${spoken}&le=de`
    case 'hapin':
    case 'kk':
      return `${pronunciationApi}${spoken}&le=ru` // 有道不支持哈萨克语, 暂时用俄语发音兜底
    case 'id':
      return `${pronunciationApi}${spoken}&le=id`
    default:
      return ''
  }
}

export default function usePronunciationSound(word: string, isLoop?: boolean) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const loop = useMemo(() => (typeof isLoop === 'boolean' ? isLoop : pronunciationConfig.isLoop), [isLoop, pronunciationConfig.isLoop])
  const [isPlaying, setIsPlaying] = useState(false)

  const [play, { stop, sound }] = useSound(generateWordSoundSrc(word, pronunciationConfig.type), {
    html5: true,
    format: ['mp3'],
    loop,
    volume: pronunciationConfig.volume,
    rate: pronunciationConfig.rate,
  } as HookOptions)

  useEffect(() => {
    if (!sound) return
    sound.loop(loop)
    return noop
  }, [loop, sound])

  useEffect(() => {
    if (!sound) return
    const unListens: Array<() => void> = []

    unListens.push(addHowlListener(sound, 'play', () => setIsPlaying(true)))
    unListens.push(addHowlListener(sound, 'end', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'pause', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'playerror', () => setIsPlaying(false)))

    return () => {
      setIsPlaying(false)
      unListens.forEach((unListen) => unListen())
      ;(sound as Howl).unload()
    }
  }, [sound])

  return { play, stop, isPlaying }
}

export function usePrefetchPronunciationSound(word: string | undefined) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  useEffect(() => {
    if (!word) return

    const soundUrl = generateWordSoundSrc(word, pronunciationConfig.type)
    if (soundUrl === '') return

    const head = document.head
    const isPrefetch = (Array.from(head.querySelectorAll('link[href]')) as HTMLLinkElement[]).some((el) => el.href === soundUrl)

    if (!isPrefetch) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.preload = 'auto'

      // gpt 说这这两行能尽可能规避下载插件被触发问题。 本地测试不加也可以，考虑到别的插件可能有问题，所以加上保险
      audio.crossOrigin = 'anonymous'
      audio.style.display = 'none'

      head.appendChild(audio)

      return () => {
        head.removeChild(audio)
      }
    }
  }, [pronunciationConfig.type, word])
}
