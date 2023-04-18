import { TypingContext } from '../../store'
import Phonetic from './components/Phonetic'
import Translation from './components/Translation'
import { default as WordComponent } from './components/Word'
import { phoneticConfigAtom } from '@/store'
import { Word } from '@/typings'
import { useAtomValue } from 'jotai'
import { useContext } from 'react'

export default function CurrentWord({ word, onFinish }: { word: Word; onFinish: () => void }) {
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  return (
    <div className="flex flex-col items-center">
      <WordComponent word={word.name} onFinish={onFinish} />
      {phoneticConfig.isOpen && <Phonetic word={word} />}
      {state.isTransVisible && <Translation trans={word.trans.join('；')} />}
    </div>
  )
}
