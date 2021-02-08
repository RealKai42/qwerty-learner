import React, { useCallback, useContext } from 'react'
import { useLocalStorage } from 'react-use'
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
  /**
   * The selected chapter number.
   */
  selectedChapter: number
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
export function useDictionaries(): Dictionary[] {
  const { state } = useContext(AppStateContext)
  return state.dictionaries
}

export function useSetDictionary(): (id: string) => void {
  const { state, dispatch } = useContext(AppStateContext)
  return (id: string) => {
    const found = dictionaries.find((dict) => dict.id === id)
    if (found !== undefined) {
      // TODO: remove magic number here.
      const lastChapterNumber = Math.floor(found.length / 20)
      dispatch({ ...state, selectedDictionary: found, selectedChapter: Math.min(state.selectedChapter, lastChapterNumber) })
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

export function useSetPronunciationState(): [status: PronunciationType, setpronunciation: (state: PronunciationType) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  const setpronunciation = useCallback((pronunciation: PronunciationType) => dispatch({ ...state, pronunciation }), [state, dispatch])
  return [state.pronunciation, setpronunciation]
}
/**
 * Use the current selected chapter.
 */
export function useSelectedChapter(): [number, (chapter: number) => void] {
  const { state, dispatch } = useContext(AppStateContext)
  return [state.selectedChapter, (selectedChapter: number): void => dispatch({ ...state, selectedChapter })]
}

const defaultState: AppState = {
  sound: true,
  dictionaries,
  selectedDictionary: dictionaries[0],
  pronunciation: 'us',
  selectedChapter: 0,
}

export const AppStateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [state, setState] = useLocalStorage<AppState>('state', defaultState)
  return <AppStateContext.Provider value={{ state: state!, dispatch: setState }}>{children}</AppStateContext.Provider>
}
