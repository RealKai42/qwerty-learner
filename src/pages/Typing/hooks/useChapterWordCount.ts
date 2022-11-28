import { useChapterWordCountState } from 'store/AppState'

export type SwitcherDispatchType = (newStatus: number) => void

const useChapterWordCount = (): [number, SwitcherDispatchType] => {
  const [chapterWordCount, setChapterWordCount] = useChapterWordCountState()

  const dispatch: SwitcherDispatchType = (newStatus) => {
    setChapterWordCount(newStatus)
  }

  return [chapterWordCount, dispatch]
}

export default useChapterWordCount
