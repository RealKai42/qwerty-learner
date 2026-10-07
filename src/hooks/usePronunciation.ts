import { pronunciationConfigAtom } from '@/store'
import type { PronunciationType } from '@/typings'
import { addHowlListener } from '@/utils'
import { beginWordPlayback, releaseWordPlayback } from '@/utils/audioPlaybackCoordinator'
import { romajiToHiragana } from '@/utils/kana'
import noop from '@/utils/noop'
import type { Howl } from 'howler'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSound from 'use-sound'
import type { HookOptions } from 'use-sound/dist/types'

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='
export function generateWordSoundSrc(word: string, pronunciation: Exclude<PronunciationType, false>): string {
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${word}&type=1`
    case 'us':
      return `${pronunciationApi}${word}&type=2`
    case 'romaji':
      return `${pronunciationApi}${romajiToHiragana(word)}&le=jap`
    case 'zh':
      return `${pronunciationApi}${word}&le=zh`
    case 'ja':
      return `${pronunciationApi}${word}&le=jap`
    case 'de':
      return `${pronunciationApi}${word}&le=de`
    case 'hapin':
    case 'kk':
      return `${pronunciationApi}${word}&le=ru` // 有道不支持哈萨克语, 暂时用俄语发音兜底
    case 'id':
      return `${pronunciationApi}${word}&le=id`
    default:
      return ''
  }
}

export default function usePronunciationSound(word: string, isLoop?: boolean) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const loop = useMemo(() => (typeof isLoop === 'boolean' ? isLoop : pronunciationConfig.isLoop), [isLoop, pronunciationConfig.isLoop])
  const [isPlaying, setIsPlaying] = useState(false)

  const [playSound, { stop: stopSound, sound }] = useSound(generateWordSoundSrc(word, pronunciationConfig.type), {
    html5: true,
    format: ['mp3'],
    loop,
    volume: pronunciationConfig.volume,
    rate: pronunciationConfig.rate,
  } as HookOptions)

  const stopSoundRef = useRef(stopSound)
  const soundRef = useRef<Howl | null>(sound ?? null)
  const loopRef = useRef(loop)
  const pendingEndCallbackRef = useRef<(() => void) | null>(null)
  stopSoundRef.current = stopSound
  soundRef.current = sound ?? null
  loopRef.current = loop

  const stop = useCallback(() => {
    pendingEndCallbackRef.current = null
    stopSoundRef.current()
    soundRef.current?.loop(loopRef.current)
    releaseWordPlayback(stop)
  }, [])

  const play = useCallback(() => {
    pendingEndCallbackRef.current = null
    soundRef.current?.loop(loopRef.current)
    beginWordPlayback(stop)
    playSound()
  }, [playSound, stop])

  const playOnce = useCallback(
    (onEnd: () => void) => {
      pendingEndCallbackRef.current = onEnd
      soundRef.current?.loop(false)
      beginWordPlayback(stop)
      playSound()
    },
    [playSound, stop],
  )

  useEffect(() => {
    if (!sound) return
    sound.loop(loop)
    return noop
  }, [loop, sound])

  useEffect(() => {
    if (!sound) return
    const unListens: Array<() => void> = []

    unListens.push(addHowlListener(sound, 'play', () => setIsPlaying(true)))
    const finishPlaying = () => {
      setIsPlaying(false)
      releaseWordPlayback(stop)
    }

    unListens.push(
      addHowlListener(sound, 'end', () => {
        const onEnd = pendingEndCallbackRef.current
        if (onEnd) {
          pendingEndCallbackRef.current = null
          if (loop) sound.stop()
          sound.loop(loop)
          finishPlaying()
          onEnd()
          return
        }
        if (!loop) finishPlaying()
      }),
    )
    const finishWithoutCallback = () => {
      pendingEndCallbackRef.current = null
      sound.loop(loop)
      finishPlaying()
    }
    unListens.push(addHowlListener(sound, 'pause', finishWithoutCallback))
    unListens.push(addHowlListener(sound, 'playerror', finishWithoutCallback))
    unListens.push(addHowlListener(sound, 'loaderror', finishWithoutCallback))

    return () => {
      setIsPlaying(false)
      unListens.forEach((unListen) => unListen())
      stop()
      ;(sound as Howl).unload()
    }
  }, [loop, sound, stop])

  return { play, playOnce, stop, isPlaying }
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
