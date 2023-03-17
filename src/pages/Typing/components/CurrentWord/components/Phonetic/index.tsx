import { phoneticConfigAtom, pronunciationConfigAtom } from '@/store'
import { Word } from '@/typings'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'

export type PhoneticProps = {
  word: Word
}

function Phonetic({ word }: PhoneticProps) {
  const [phoneticConfig, setPhoneticConfig] = useAtom(phoneticConfigAtom)

  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  useEffect(() => {
    if (pronunciationConfig.type === 'us') {
      setPhoneticConfig((old) => ({ ...old, type: 'us' }))
    } else if (pronunciationConfig.type === 'uk') {
      setPhoneticConfig((old) => ({ ...old, type: 'uk' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronunciationConfig])

  return (
    <div className="space-x-5 pt-1 text-center text-sm font-normal text-gray-600 transition-colors duration-300 dark:text-gray-400">
      {phoneticConfig.type === 'us' && word.usphone && word.usphone.length > 1 && <span>{`AmE: [${word.usphone}]`}</span>}
      {phoneticConfig.type === 'uk' && word.ukphone && word.ukphone.length > 1 && <span>{`BrE: [${word.ukphone}]`}</span>}
    </div>
  )
}

export default Phonetic
