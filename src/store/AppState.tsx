import { omit } from 'lodash'
import React, { useCallback, useContext } from 'react'
import { useLocalStorage } from 'react-use'
import { dictionaries, Dictionary } from 'resources/dictionary'

export type PronunciationType = 'us' | 'uk' | 'jap' | false

export type AppState = {
  /**
   * Whether the sound is enabled.
   */
  sound: boolean
  /**
   * Available dictionaries.
   * This field should not be written to `localStorage`.
   */
  dictionaries: Dictionary[]
  /**
   * The selected dictionary.
   */
  selectedDictionary: Dictionary
  /**
   * Which type of pronunciation is used.
   * Available options: `"us"`, `"uk"`, `"jap"`and `false`.
   */
  pronunciation: PronunciationType
  /**
   * The selected chapter number.
   */
  selectedChapter: number
  /**
   * Whether random word is enabled
   */
  random: boolean
  /**
   * Whether dark mode is enabled
   */
  darkMode: boolean
}

export type AppStateData = {
  state: AppState
  dispatch: (state: AppState) => void
}

const AppStateContext = React.createContext<AppStateData>({} as AppStateData)

/**
 * Get the global app state.
 */
export function useAppState(): AppState {
  const { state } = useContext(AppStateContext)
  return state
}

export function useSetSoundState(): [status: boolean, setSound: (state: boolean) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  const setSound = useCallback((sound: boolean) => dispatch({ ...state, sound }), [state, dispatch])
  return [state.sound, setSound]
}

export function useRandomState(): [status: boolean, setRandom: (state: boolean) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  const setRandom = useCallback((random: boolean) => dispatch({ ...state, random }), [state, dispatch])
  return [state.random, setRandom]
}

/**
 * Use all available dictionaries.
 */
export function useDictionaries(): Dictionary[] {
  const { state } = useContext(AppStateContext)
  return state.dictionaries
}

export function useSetDictionary(): (id: string) => void {
  const { state, dispatch } = useContext(AppStateContext)
  return (id: string) => {
    const found = dictionaries.find((dict) => dict.id === id)
    if (found !== undefined) {
      dispatch({ ...state, selectedDictionary: found, selectedChapter: 0 })
    }
  }
}

/**
 * Use the current selected dictionary.
 */
export function useSelectedDictionary(): Dictionary {
  const { state } = useContext(AppStateContext)
  return state.selectedDictionary
}

export function useSetPronunciationState(): [status: PronunciationType, setPronunciation: (state: PronunciationType) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  const setPronunciation = useCallback((pronunciation: PronunciationType) => dispatch({ ...state, pronunciation }), [state, dispatch])
  return [state.pronunciation, setPronunciation]
}

/**
 * Use the current selected chapter.
 */
export function useSelectedChapter(): [number, (chapter: number) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  return [state.selectedChapter, (selectedChapter: number): void => dispatch({ ...state, selectedChapter })]
}

/**
 * Dark Mode
 */
export function useDarkMode(): [darkMode: boolean, setDarkMode: (state: boolean) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  const setDarkMode = useCallback(
    (darkMode: boolean) => {
      dispatch({ ...state, darkMode })
      darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
    },
    [state, dispatch],
  )

  return [state.darkMode, setDarkMode]
}

const defaultState: AppState = {
  sound: true,
  dictionaries,
  selectedDictionary: dictionaries[0],
  pronunciation: 'us',
  selectedChapter: 0,
  random: false,
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
}

export const AppStateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [state, setState] = useLocalStorage<AppState>('state', defaultState, options)
  return <AppStateContext.Provider value={{ state: state!, dispatch: setState }}>{children}</AppStateContext.Provider>
}

const options = {
  raw: false,
  serializer(state: AppState): string {
    return JSON.stringify(omit(state, 'dictionaries'))
  },
  deserializer(source: string): AppState {
    const state: AppState = JSON.parse(source)
    state.dictionaries = dictionaries
    return state
  },
}
