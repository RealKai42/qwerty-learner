import { useState } from 'react'
import { useSetSoundState } from 'components/AppSettings'

export type switcherStateType = {
  phonetic: boolean
  wordVisible: boolean
  sound: boolean
}

export type switcherDispatchType = (type: string, newStatus?: boolean) => void

const useSwitcherState = (initialState: { phonetic: boolean; wordVisible: boolean }): [switcherStateType, switcherDispatchType] => {
  const [phonetic, setPhonetic] = useState(initialState.phonetic)
  const [wordVisible, setWordVisible] = useState(initialState.wordVisible)
  const [sound, setSound] = useSetSoundState()

  const dispatch: switcherDispatchType = (type, newStatus) => {
    switch (type) {
      case 'phonetic':
        newStatus === undefined ? setPhonetic(!phonetic) : setPhonetic(newStatus)
        break
      case 'wordVisible':
        newStatus === undefined ? setWordVisible(!wordVisible) : setWordVisible(newStatus)
        break
      case 'sound':
        newStatus === undefined ? setSound(!sound) : setSound(newStatus)
    }
  }

  return [{ phonetic, wordVisible, sound }, dispatch]
}

export default useSwitcherState
