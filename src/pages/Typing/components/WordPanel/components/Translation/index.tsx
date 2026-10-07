import Tooltip from '@/components/Tooltip'
import { SoundIcon } from '@/components/WordPronunciationIcon/SoundIcon'
import { useDefinitionSpeech } from '@/contexts/DefinitionSpeechContext'
import { fontSizeConfigAtom, isTextSelectableAtom, pronunciationConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

export type TranslationProps = {
  trans: string
  speechId: string
  showTrans?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function Translation({ trans, speechId, showTrans = true, onMouseEnter, onMouseLeave }: TranslationProps) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const { speak, speakingId, error } = useDefinitionSpeech()
  const isShowTransRead = pronunciationConfig.isTransRead
  const isCantoneseMode = pronunciationConfig.transSpeechMode === 'cantonese'

  const handleClickSoundIcon = useCallback(() => {
    speak(trans, speechId)
  }, [speak, speechId, trans])

  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  return (
    <div className={`flex items-center justify-center  pb-4 pt-5`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <span
        className={`max-w-4xl text-center font-sans transition-colors duration-300 dark:text-white dark:text-opacity-80 ${
          isShowTransRead && 'pl-8'
        } ${isTextSelectable && 'select-text'}`}
        style={{ fontSize: fontSizeConfig.translateFont.toString() + 'px' }}
      >
        {showTrans ? trans : '\u00A0'}
      </span>
      {isShowTransRead && showTrans && (
        <Tooltip
          content={isCantoneseMode ? '用粤语朗读中文释义' : '跟随系统朗读中文释义'}
          className="ml-3 h-5 w-5 cursor-pointer leading-7"
        >
          <SoundIcon
            animated={speakingId === speechId}
            onClick={handleClickSoundIcon}
            className="h-5 w-5"
            ariaLabel={isCantoneseMode ? '用粤语朗读中文释义' : '跟随系统朗读中文释义'}
          />
        </Tooltip>
      )}
      {isShowTransRead && showTrans && error && (
        <span className="ml-2 max-w-xs text-left text-xs text-red-500" role="status">
          {error}
        </span>
      )}
    </div>
  )
}
