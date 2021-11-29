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
      case 'jap':
        setPronunciation('jap')
        break
      case 'fr':
        setPronunciation('fr')
        break
      case 'ko':
        setPronunciation('ko')
        break
      case 'false':
        setPronunciation(false)
        break
    }
  }

  return [pronunciation, dispatch]
}

export default usePronunciation
