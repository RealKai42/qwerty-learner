import { useState } from 'react'
import { useSetSoundState } from 'store/AppState'

export type SwitcherStateType = {
  phonetic: boolean
  wordVisible: boolean
  sound: boolean
  userPhonetic: boolean
}

export type SwitcherDispatchType = (type: string, newStatus?: boolean) => void

const useSwitcherState = (initialState: { phonetic: boolean; wordVisible: boolean }): [SwitcherStateType, SwitcherDispatchType] => {
  const [phonetic, setPhonetic] = useState(initialState.phonetic)
  const [userPhonetic, setUserPhonetic] = useState(initialState.phonetic)
  const [wordVisible, setWordVisible] = useState(initialState.wordVisible)
  const [sound, setSound] = useSetSoundState()

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
      case 'userPhonetic':
        newStatus === undefined ? setUserPhonetic(!userPhonetic) : setUserPhonetic(newStatus)
    }
  }

  return [{ phonetic, wordVisible, sound, userPhonetic }, dispatch]
}

export default useSwitcherState
