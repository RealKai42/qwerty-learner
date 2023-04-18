import { SoundIcon } from '../SoundIcon'
import useSpeech from '@/hooks/useSpeech'
import { isTextSelectableAtom, pronunciationConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'

export type TranslationProps = {
  trans: string
}
export default function Translation({ trans }: TranslationProps) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  const { speak, speaking } = useSpeech(trans, {
    volume: pronunciationConfig.transVolume,
  })

  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  return (
    <div
      className={`max-w-4xl pb-4 pt-5 text-center font-sans text-lg transition-colors duration-300 dark:text-white dark:text-opacity-80 ${
        !isTextSelectable && 'select-none'
      }`}
    >
      {trans}
      {window.speechSynthesis && pronunciationConfig.isTransRead && (
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
