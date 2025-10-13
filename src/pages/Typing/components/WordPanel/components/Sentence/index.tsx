import { fontSizeConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'

export type SentenceProps = {
  sentences: string
}

export default function Sentence({ sentences }: SentenceProps) {
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)

  return (
    <div className={`flex items-center justify-center  pb-1 pt-1`}>
      <span
        className={`max-w-4xl text-center font-sans transition-colors duration-300 dark:text-white dark:text-opacity-80`}
        style={{ fontSize: fontSizeConfig.sentenceFont.toString() + 'px' }}
      >
        {sentences}
      </span>
    </div>
  )
}
