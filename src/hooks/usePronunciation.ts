import { useEffect, useState } from 'react'
import { PronunciationType, useAppState } from 'store/AppState'
import useSound from 'use-sound'
import { HookOptions } from 'use-sound/dist/types'
import { addHowlListener } from '../utils/utils'

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='
function generateWordSoundSrc(word: string, pronunciation: PronunciationType) {
  switch (pronunciation) {
    case 'uk':
      return `${pronunciationApi}${word}&type=1`
    case 'us':
      return `${pronunciationApi}${word}&type=2`
  }
}

export default function usePronunciationSound(word: string) {
  const { pronunciation } = useAppState()
  const [isPlaying, setIsPlaying] = useState(false)

  const [play, { stop, sound }] = useSound(generateWordSoundSrc(word, pronunciation), {
    html5: true,
    format: ['mp3'],
  } as HookOptions)

  useEffect(() => {
    if (!sound) return

    const unListens: Array<() => void> = []

    setIsPlaying(true)

    unListens.push(addHowlListener(sound, 'play', () => setIsPlaying(true)))
    unListens.push(addHowlListener(sound, 'end', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'pause', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'playerror', () => setIsPlaying(false)))

    return () => {
      unListens.forEach((unListen) => unListen())
    }
  }, [sound])

  return { play, stop, isPlaying }
}
