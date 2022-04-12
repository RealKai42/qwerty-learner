import { useState } from 'react'
import { useSetSoundState, useDarkMode, useRandomState } from 'store/AppState'

export type SwitcherStateType = {
  phonetic: boolean
  wordVisible: boolean
  sound: boolean
  random: boolean
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
  const [random, setRandom] = useRandomState()
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
      case 'random':
        setRandom(newStatus ?? !random)
        break
      case 'darkMode':
        setDarkMode(newStatus ?? !darkMode)
    }
  }
  return [{ phonetic, wordVisible, sound, random, darkMode }, dispatch]
}

export default useSwitcherState
