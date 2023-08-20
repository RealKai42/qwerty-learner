import type { groupedWordRecords } from '../type'
import { atom } from 'jotai'

export const currentRowDetailAtom = atom<groupedWordRecords | null>(null)
