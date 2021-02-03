type ActionMap1<M extends { [index: string]: any }> = {
  [Key in keyof M]: {
    type: Key
    state: M[Key]
  }
}
type ActionMap2<M extends { [index: string]: any }> = {
  [Key in keyof M]: {
    type: Key
  }
}

export type switcherActionTypes = 'sound' | 'wordVisible' | 'phonetic' | 'toggleSound' | 'toggleWordVisible' | 'togglePhonetic'
export type switcherState = {
  sound: boolean
  wordVisible: boolean
  phonetic: boolean
}
export type switcherWithPayload = {
  [key in 'sound' | 'wordVisible' | 'phonetic']: boolean
}
export type switcherWithouPayload = {
  [key in 'toggleSound' | 'toggleWordVisible' | 'togglePhonetic']: null
}

export type switcherActions =
  | ActionMap1<switcherWithPayload>[keyof ActionMap1<switcherWithPayload>]
  | ActionMap2<switcherWithouPayload>[keyof ActionMap2<switcherWithouPayload>]

export const switcherReducer = (state: switcherState, action: switcherActions) => {
  switch (action.type) {
    case 'sound':
      return { ...state, sound: action.state }
    case 'wordVisible':
      return { ...state, wordVisible: action.state }
    case 'phonetic':
      return { ...state, phonetic: action.state }
    case 'toggleSound':
      return { ...state, sound: !state.sound }
    case 'toggleWordVisible':
      return { ...state, wordVisible: !state.wordVisible }
    case 'togglePhonetic':
      return { ...state, phonetic: !state.phonetic }
    default:
      return state
  }
}
