import { useAppSettings } from 'components/AppSettings'
import { noop } from 'lodash'
import { useEffect, useState } from 'react'

declare type PronounceFunction = () => void

const pronunciationApi = 'http://dict.youdao.com/dictvoice?audio='

export default function usePronunciationSound(word: string): PronounceFunction {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const { pronunciation } = useAppSettings()
  const ukPronounceFunction = () => {
    audio?.pause()
    setAudio(new Audio(pronunciationApi + word + '&type=1'))
  }

  const usPronounceFunction = () => {
    audio?.pause()
    setAudio(new Audio(pronunciationApi + word + '&type=2'))
  }

  useEffect(() => {
    audio?.play()
  }, [audio])
  switch (pronunciation) {
    case false:
      return noop
    case 'uk':
      return ukPronounceFunction
    case 'us':
      return usPronounceFunction
  }
}
