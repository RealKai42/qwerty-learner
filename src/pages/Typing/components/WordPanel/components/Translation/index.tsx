import Tooltip from '@/components/Tooltip'
import { SoundIcon } from '@/components/WordPronunciationIcon/SoundIcon'
import useSpeech from '@/hooks/useSpeech'
import { fontSizeConfigAtom, isTextSelectableAtom, pronunciationConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import IconFlag from '~icons/tabler/flag'

export type TranslationProps = {
  trans: string
  showTrans?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  word?: string
  dictionary?: string
  onReportTranslation?: () => void
}

export default function Translation({
  trans,
  showTrans = true,
  onMouseEnter,
  onMouseLeave,
  word,
  dictionary,
  onReportTranslation,
}: TranslationProps) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const isShowTransRead = window.speechSynthesis && pronunciationConfig.isTransRead
  const speechOptions = useMemo(() => ({ volume: pronunciationConfig.transVolume }), [pronunciationConfig.transVolume])
  const { speak, speaking } = useSpeech(trans, speechOptions)

  const handleClickSoundIcon = useCallback(() => {
    speak(true)
  }, [speak])

  const [showReportButton, setShowReportButton] = useState(false)

  const handleReportClick = useCallback(() => {
    if (onReportTranslation) {
      onReportTranslation()
    }
  }, [onReportTranslation])

  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  const canShowReportButton = word && dictionary && onReportTranslation && showTrans && trans.trim() !== ''

  return (
    <div
      className={`flex items-center justify-center pb-4 pt-5`}
      onMouseEnter={(e) => {
        onMouseEnter?.()
        if (canShowReportButton) {
          setShowReportButton(true)
        }
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.()
        setShowReportButton(false)
      }}
    >
      <span
        className={`max-w-4xl text-center font-sans transition-colors duration-300 dark:text-white dark:text-opacity-80 ${
          isShowTransRead && 'pl-8'
        } ${isTextSelectable && 'select-text'}`}
        style={{ fontSize: fontSizeConfig.translateFont.toString() + 'px' }}
      >
        {showTrans ? trans : '\u00A0'}
      </span>

      <div className="ml-3 flex items-center">
        {isShowTransRead && showTrans && (
          <Tooltip content="朗读释义" className="h-5 w-5 cursor-pointer leading-7">
            <SoundIcon animated={speaking} onClick={handleClickSoundIcon} className="h-5 w-5" />
          </Tooltip>
        )}

        {canShowReportButton && showReportButton && (
          <Tooltip content="Report translation issue" className="ml-2 h-5 w-5 cursor-pointer leading-7">
            <button
              onClick={handleReportClick}
              className="flex h-5 w-5 items-center justify-center text-gray-400 transition-colors duration-200 hover:text-orange-500 focus:outline-none"
              aria-label="Report translation issue"
            >
              <IconFlag className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
