import { useState } from 'react'
import { useSetPronunciationState, useSetSoundState } from 'components/AppSettings'

export type SwitcherStateType = {
  phonetic: boolean
  wordVisible: boolean
  sound: boolean
  pronunciation: boolean
}

export type SwitcherDispatchType = (type: string, newStatus?: boolean) => void

const useSwitcherState = (initialState: { phonetic: boolean; wordVisible: boolean }): [SwitcherStateType, SwitcherDispatchType] => {
  const [phonetic, setPhonetic] = useState(initialState.phonetic)
  const [wordVisible, setWordVisible] = useState(initialState.wordVisible)
  const [sound, setSound] = useSetSoundState()
  const [pronunciation, setPronunciation] = useSetPronunciationState()

  const dispatch: SwitcherDispatchType = (type, newStatus) => {
    switch (type) {
      case 'phonetic':
        newStatus === undefined ? setPhonetic(!phonetic) : setPhonetic(newStatus)
        break
      case 'wordVisible':
        newStatus === undefined ? setWordVisible(!wordVisible) : setWordVisible(newStatus)
        break
      case 'sound':
        newStatus === undefined ? setSound(!sound) : setSound(newStatus)
        break
      case 'pronunciation':
        newStatus === undefined ? setPronunciation(!pronunciation) : setPronunciation(newStatus)
    }
  }

  return [{ phonetic, wordVisible, sound, pronunciation }, dispatch]
}

export default useSwitcherState
