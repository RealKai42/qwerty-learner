import { phoneticConfigAtom } from '@/store'
import { Word } from '@/typings'
import { WordStat } from '@/typings'
import { useAtomValue } from 'jotai'
import Phonetic from './components/Phonetic'
import Translation from './components/Translation'
import { default as WordComponent } from './components/Word'

export type CurrentWordProps = {
  word: Word
  onFinish: (wordStat: WordStat) => void
}

export default function CurrentWord({ word, onFinish }: CurrentWordProps) {
  const phoneticConfig = useAtomValue(phoneticConfigAtom)

  return (
    <div className="flex flex-col items-center">
      <WordComponent word={word.name} onFinish={onFinish} />
      {phoneticConfig.isOpen && <Phonetic word={word} />}
      <Translation trans={word.trans.join('；')} />
    </div>
  )
}
