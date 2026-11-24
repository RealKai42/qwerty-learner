import { isTextSelectableAtom, phoneticConfigAtom } from '@/store'
import type { Word, WordWithIndex } from '@/typings'
import { useAtomValue } from 'jotai'

export type PhoneticProps = {
  word: WordWithIndex | Word
}

function Phonetic({ word }: PhoneticProps) {
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  // owe's American phonetic is the single letter "o". Empty values stay hidden.
  const usphone = word.usphone?.trim()
  const ukphone = word.ukphone?.trim()

  return (
    <div
      className={`space-x-5 text-center text-sm font-normal text-gray-600 transition-colors duration-300 dark:text-gray-400 ${
        isTextSelectable && 'select-text'
      }`}
    >
      {phoneticConfig.type === 'us' && usphone && <span>{`AmE: [${usphone}]`}</span>}
      {phoneticConfig.type === 'uk' && ukphone && <span>{`BrE: [${ukphone}]`}</span>}
    </div>
  )
}

export default Phonetic
