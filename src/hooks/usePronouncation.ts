import { useAppSettings } from 'components/AppSettings'
import { noop } from 'lodash'
import { useEffect, useState } from 'react'

declare type PronounceFunction = () => void

const pronunciationApi = 'http://dict.youdao.com/dictvoice?audio='

export default function usePronunciationSound(word: string): PronounceFunction {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const { pronunciation } = useAppSettings()
  const pronounceFunction = () => {
    audio?.pause()
    setAudio(new Audio(pronunciationApi + word))
  }

  useEffect(() => {
    audio?.play()
  }, [audio])
  return pronunciation ? pronounceFunction : noop
}
