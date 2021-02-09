import { useAppSettings } from 'components/AppSettings'
import { noop } from 'lodash'
import { useEffect, useState } from 'react'

declare type PronounceFunction = () => void

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export default function usePronunciationSound(word: string): PronounceFunction {
  word = word.replace(new RegExp('_', 'g'), ' ')

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const { pronunciation } = useAppSettings()
  const ukPronounceFunction = () => setAudio(new Audio(pronunciationApi + word + '&type=1'))
  const usPronounceFunction = () => setAudio(new Audio(pronunciationApi + word + '&type=2'))

  useEffect(() => {
    audio?.play()
    return () => {
      // Pause the audio when unmount
      audio?.pause()
    }
  }, [audio, word])

  switch (pronunciation) {
    case false:
      return noop
    case 'uk':
      return ukPronounceFunction
    case 'us':
      return usPronounceFunction
  }
}
