import { SoundIcon } from '../SoundIcon'
import useSpeech from '@/hooks/useSpeech'
import { isTextSelectableAtom, pronunciationIsTransReadAtom } from '@/store'
import { useAtomValue } from 'jotai'

export type TranslationProps = {
  trans: string
}
export default function Translation({ trans }: TranslationProps) {
  const pronunciationIsTransRead = useAtomValue(pronunciationIsTransReadAtom)
  const { speak, speaking } = useSpeech(trans)

  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  return (
    <div
      className={`max-w-4xl pb-4 pt-5 text-center font-sans text-lg transition-colors duration-300 dark:text-white dark:text-opacity-80 ${
        !isTextSelectable && 'select-none'
      }`}
    >
      {trans}
      {window.speechSynthesis && pronunciationIsTransRead && (
        <SoundIcon
          animated={speaking}
          onClick={() => {
            speak(true)
          }}
          className="absolute inset-y-0 -right-8 my-auto h-5 w-5 cursor-pointer leading-7"
        />
      )}
    </div>
  )
}
