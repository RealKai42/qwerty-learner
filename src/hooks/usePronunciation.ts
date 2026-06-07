import { pronunciationConfigAtom } from '@/store'
import type { PronunciationType } from '@/typings'
import { addHowlListener } from '@/utils'
import { romajiToHiragana } from '@/utils/kana'
import { Howl } from 'howler'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='
export function generateWordSoundSrc(word: string, pronunciation: Exclude<PronunciationType, false>): string {
  const encodedWord = encodeURIComponent(word)
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${encodedWord}&type=1`
    case 'us':
      return `${pronunciationApi}${encodedWord}&type=2`
    case 'romaji':
      return `${pronunciationApi}${encodeURIComponent(romajiToHiragana(word))}&le=jap`
    case 'zh':
      return `${pronunciationApi}${encodedWord}&le=zh`
    case 'ja':
      return `${pronunciationApi}${encodedWord}&le=jap`
    case 'de':
      return `${pronunciationApi}${encodedWord}&le=de`
    case 'hapin':
    case 'kk':
      return `${pronunciationApi}${encodedWord}&le=ru`
    case 'id':
      return `${pronunciationApi}${encodedWord}&le=id`
    default:
      return ''
  }
}

export default function usePronunciationSound(word: string, isLoop?: boolean) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const loop = useMemo(() => (typeof isLoop === 'boolean' ? isLoop : pronunciationConfig.isLoop), [isLoop, pronunciationConfig.isLoop])
  const [isPlaying, setIsPlaying] = useState(false)
  const howlRef = useRef<Howl | null>(null)
  const fallbackRef = useRef(false) // true if using TTS fallback

  useEffect(() => {
    fallbackRef.current = false
    const src = generateWordSoundSrc(word, pronunciationConfig.type)
    if (!src) {
      howlRef.current = null
      return
    }

    const howl = new Howl({
      src,
      html5: true,
      format: ['mp3'],
      loop,
      volume: pronunciationConfig.volume,
      rate: pronunciationConfig.rate,
    })

    howlRef.current = howl

    const unListens: Array<() => void> = []
    unListens.push(addHowlListener(howl, 'play', () => setIsPlaying(true)))
    unListens.push(addHowlListener(howl, 'end', () => setIsPlaying(false)))
    unListens.push(addHowlListener(howl, 'pause', () => setIsPlaying(false)))

    // Fallback to browser TTS when Youdao fails (loaderror or playerror)
    const fallbackToTTS = () => {
      fallbackRef.current = true
      howlRef.current = null
      const synth = window.speechSynthesis
      if (!synth) {
        setIsPlaying(false)
        return
      }
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = pronunciationConfig.rate
      utterance.volume = pronunciationConfig.volume
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      synth.speak(utterance)
    }

    unListens.push(addHowlListener(howl, 'loaderror', fallbackToTTS))
    unListens.push(addHowlListener(howl, 'playerror', fallbackToTTS))

    return () => {
      setIsPlaying(false)
      unListens.forEach((unListen) => unListen())
      howl.unload()
      howlRef.current = null
    }
  }, [word, pronunciationConfig.type, loop, pronunciationConfig.volume, pronunciationConfig.rate])

  const play = useCallback(() => {
    if (fallbackRef.current) {
      // Already using TTS fallback, re-speak
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = pronunciationConfig.rate
      utterance.volume = pronunciationConfig.volume
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      synth.speak(utterance)
    } else {
      howlRef.current?.play()
    }
  }, [word, pronunciationConfig.rate, pronunciationConfig.volume])

  const stop = useCallback(() => {
    if (fallbackRef.current) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      howlRef.current?.stop()
    }
  }, [])

  return { play, stop, isPlaying }
}

export function usePrefetchPronunciationSound(word: string | undefined) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  useEffect(() => {
    if (!word) return

    const soundUrl = generateWordSoundSrc(word, pronunciationConfig.type)
    if (soundUrl === '') return

    const head = document.head
    const existingLink = head.querySelector(`link[href="${soundUrl}"]`)
    if (existingLink) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'audio'
    link.href = soundUrl
    link.crossOrigin = 'anonymous'
    head.appendChild(link)

    return () => {
      head.removeChild(link)
    }
  }, [pronunciationConfig.type, word])
}
