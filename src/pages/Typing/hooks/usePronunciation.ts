import { useSetPronunciationState, PronunciationType } from '@/store/AppState'

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
      case 'romaji':
        setPronunciation('romaji')
        break
      case 'false':
        setPronunciation(false)
        break
      case 'zh':
        setPronunciation('zh')
        break
      case 'jp':
        setPronunciation('jp')
        break
      case 'ko':
        setPronunciation('ko')
        break
    }
  }

  return [pronunciation, dispatch]
}

export default usePronunciation
