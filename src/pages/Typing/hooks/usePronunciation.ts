import { useSetPronunciationState, PronunciationType } from 'store/AppState'

export type SwitcherDispatchType = (newStatus?: string) => void

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
      case 'false':
        setPronunciation(false)
        break
    }
  }

  return [pronunciation, dispatch]
}

export default usePronunciation
