import React, { useCallback, useContext, useState } from 'react'
import { dictionaries, Dictionary } from 'resources/dictionary'

export type PronunciationType = 'us' | 'uk' | false

export type AppState = {
  /**
   * Whether the sound is enabled.
   */
  sound: boolean
  /**
   * Avaiable dictionaries.
   */
  dictionaries: Dictionary[]
  /**
   * The selected dictionary.
   */
  selectedDictionary: Dictionary
  pronunciation: PronunciationType
}

export type AppStateData = {
  state: AppState
  dispatch: (state: AppState) => void
}

const AppStateContext = React.createContext<AppStateData>({} as AppStateData)

export function useAppSettings(): AppState {
  const { state } = useContext(AppStateContext)
  return state
}

export function useSetSoundState(): [status: boolean, setSound: (state: boolean) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  const setSound = useCallback((sound: boolean) => dispatch({ ...state, sound }), [state, dispatch])
  return [state.sound, setSound]
}

/**
 * Use all available dictionaries.
 */
export function useDictionaries(): [Dictionary[], (id: string) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  return [
    state.dictionaries,
    (id: string) => {
      const found = dictionaries.find((dict) => dict.id === id)
      if (found !== undefined) {
        dispatch({ ...state, selectedDictionary: found })
      }
    },
  ]
}

/**
 * Use the current selected dictionary.
 */
export function useSelectedDictionary(): Dictionary {
  const { state } = useContext(AppStateContext)
  return state.selectedDictionary
}

export function useSetPronunciationState(): [status: PronunciationType, setpronunciation: (state: PronunciationType) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  const setpronunciation = useCallback((pronunciation: PronunciationType) => dispatch({ ...state, pronunciation }), [state, dispatch])
  return [state.pronunciation, setpronunciation]
}

const defaultState: AppState = {
  sound: true,
  dictionaries,
  selectedDictionary: dictionaries[0],
  pronunciation: 'us',
}

export const AppStateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState)
  return <AppStateContext.Provider value={{ state: state, dispatch: setState }}>{children}</AppStateContext.Provider>
}
