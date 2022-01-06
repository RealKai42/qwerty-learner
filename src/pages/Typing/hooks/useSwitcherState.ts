import { useState } from 'react'
import { useSetSoundState, useDarkMode, useAutoMode } from 'store/AppState'

export type SwitcherStateType = {
  phonetic: boolean
  wordVisible: boolean
  sound: boolean
  darkMode: boolean
  autoMode: boolean
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
  const [darkMode, setDarkMode] = useDarkMode()
  const [autoMode, setAutoMode] = useAutoMode()
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
      case 'darkMode':
        setDarkMode(newStatus ?? !darkMode)
        break
      case 'autoMode':
        setAutoMode(newStatus ?? !autoMode)
    }
  }
  return [{ phonetic, wordVisible, sound, darkMode, autoMode }, dispatch]
}

export default useSwitcherState
