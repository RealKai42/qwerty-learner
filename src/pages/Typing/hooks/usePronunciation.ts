import { useSetPronunciationState, PronunciationType } from '@/store/AppState'

export type SwitcherDispatchType = (newStatus: PronunciationType) => void

const usePronunciation = (): [PronunciationType, SwitcherDispatchType] => {
  const [pronunciation, setPronunciation] = useSetPronunciationState()

  const dispatch: SwitcherDispatchType = (newStatus) => {
    switch (newStatus) {
      case 'uk':
        setPronunciation('uk')
        break
      case 'us':
        setPronunciation('us')
        break
      case 'romaji':
        setPronunciation('romaji')
        break
      case 'zh':
        setPronunciation('zh')
        break
      case 'ja':
        setPronunciation('ja')
        break
      case false:
        setPronunciation(false)
        break
    }
  }

  return [pronunciation, dispatch]
}

export default usePronunciation
