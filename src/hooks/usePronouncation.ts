import { useAppSettings } from 'components/AppSettings'
import { noop } from 'lodash'

declare type PronounceFunction = () => void

const pronunciationApi = 'http://dict.youdao.com/dictvoice?audio='

export default function usepronunciationSound(word: string): [PronounceFunction] {
  // SAFETY: We are trying to build an hook here.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pronunciation } = useAppSettings()
  const pronounceFunction = () => {
    var audio = new Audio(pronunciationApi + word)
    audio.play()
  }
  return pronunciation ? [pronounceFunction] : [noop]
}
