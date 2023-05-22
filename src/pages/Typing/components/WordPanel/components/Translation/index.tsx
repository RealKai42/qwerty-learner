import { SoundIcon } from '../SoundIcon'
import Tooltip from '@/components/Tooltip'
import useSpeech from '@/hooks/useSpeech'
import { isTextSelectableAtom, pronunciationConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

export type TranslationProps = {
  trans: string
}
export default function Translation({ trans }: TranslationProps) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const isShowTransRead = window.speechSynthesis && pronunciationConfig.isTransRead
  const speechOptions = useMemo(() => ({ volume: pronunciationConfig.transVolume }), [pronunciationConfig.transVolume])
  const { speak, speaking } = useSpeech(trans, speechOptions)

  const handleClickSoundIcon = useCallback(() => {
    speak(true)
  }, [speak])

  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  return (
    <div className={`flex items-center justify-center  pb-4 pt-5`}>
      <span
        className={`max-w-4xl text-center font-sans text-lg transition-colors duration-300 dark:text-white dark:text-opacity-80 ${
          isShowTransRead && 'pl-8'
        } ${isTextSelectable && 'select-text'}`}
      >
        {trans}
      </span>
      {isShowTransRead && (
        <Tooltip content="朗读释义" className="ml-3 h-5 w-5 cursor-pointer leading-7">
          <SoundIcon animated={speaking} onClick={handleClickSoundIcon} className="h-full w-full" />
        </Tooltip>
      )}
    </div>
  )
}
