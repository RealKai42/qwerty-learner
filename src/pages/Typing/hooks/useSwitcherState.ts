import { useState } from 'react'
import { useSetSoundState, useDarkMode } from 'store/AppState'

export type SwitcherStateType = {
  phonetic: boolean
  wordVisible: boolean
  sound: boolean
  userPhonetic: boolean
  darkMode: boolean
}

export type SwitcherDispatchType = (type: string, newStatus?: boolean) => void

const useSwitcherState = (initialState: {
  phonetic: boolean
  wordVisible: boolean
  darkMode?: boolean
}): [SwitcherStateType, SwitcherDispatchType] => {
  const [phonetic, setPhonetic] = useState(initialState.phonetic)
  const [wordVisible, setWordVisible] = useState(initialState.wordVisible)
  const [sound, setSound] = useSetSoundState()
  const [userPhonetic, setUserPhonetic] = useState(initialState.phonetic)
  const [darkMode, setDarkMode] = useDarkMode()

  const dispatch: SwitcherDispatchType = (type, newStatus) => {
    switch (type) {
      case 'phonetic':
        setPhonetic(newStatus ?? !phonetic)
        break
      case 'wordVisible':
        setWordVisible(newStatus ?? !wordVisible)
        break
      case 'sound':
        setSound(newStatus ?? !sound)
        break
      case 'userPhonetic':
        setUserPhonetic(newStatus ?? !userPhonetic)
        break
      case 'darkMode':
        setDarkMode(newStatus ?? !darkMode)
    }
  }
  return [{ phonetic, wordVisible, sound, darkMode, userPhonetic }, dispatch]
}

export default useSwitcherState
