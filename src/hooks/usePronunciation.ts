import { useAppState } from 'store/AppState'
import { noop } from 'lodash'
import { useEffect, useState } from 'react'

declare type PronounceFunction = () => void

const pronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export default function usePronunciationSound(word: string): PronounceFunction {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const { pronunciation } = useAppState()
  const ukPronounceFunction = () => setAudio(new Audio(pronunciationApi + word + '&type=1'))
  const usPronounceFunction = () => setAudio(new Audio(pronunciationApi + word + '&type=2'))

  useEffect(() => {
    audio?.play()
    return () => {
      // Pause the audio when unMount
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
