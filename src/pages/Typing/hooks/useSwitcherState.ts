import { useState } from 'react'
import { useSetSoundState, useDarkMode } from 'store/AppState'

export type SwitcherStateType = {
  phonetic: boolean
  wordVisible: boolean
  sound: boolean
  darkMode: boolean
  loop: boolean
}

export type SwitcherDispatchType = (type: string, newStatus?: boolean) => void

const useSwitcherState = (initialState: {
  phonetic: boolean
  wordVisible: boolean
  loop: boolean
  darkMode?: boolean
}): [SwitcherStateType, SwitcherDispatchType] => {
  const [phonetic, setPhonetic] = useState(initialState.phonetic)
  const [wordVisible, setWordVisible] = useState(initialState.wordVisible)
  const [loop, setLoop] = useState(initialState.loop)
  const [sound, setSound] = useSetSoundState()
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
      case 'darkMode':
        setDarkMode(newStatus ?? !darkMode)
        break
      case 'loop':
        setLoop(newStatus ?? !loop)
    }
  }
  return [{ phonetic, wordVisible, sound, darkMode, loop }, dispatch]
}

export default useSwitcherState
