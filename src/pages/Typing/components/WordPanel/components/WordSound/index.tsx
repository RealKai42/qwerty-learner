import type { SoundIconProps } from '../SoundIcon'
import { SoundIcon } from '../SoundIcon'
import styles from './index.module.css'
import Tooltip from '@/components/Tooltip'
import usePronunciationSound from '@/hooks/usePronunciation'
import { TypingContext } from '@/pages/Typing/store'
import { pronunciationIsOpenAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const WordSound = ({ word, inputWord, ...rest }: WordSoundProps) => {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  const { play, stop, isPlaying } = usePronunciationSound(word)
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)

  useHotkeys(
    'ctrl+j',
    () => {
      if (state.isTyping) {
        stop()
        play()
      }
    },
    [play, stop, state.isTyping],
    { enableOnFormTags: true, preventDefault: true },
  )
  useEffect(() => {
    if (inputWord.length === 0 && state.isTyping) {
      stop()
      play()
    }
  }, [play, inputWord, stop, state.isTyping])

  useEffect(() => {
    return stop
  }, [word, stop])

  const handleClickSoundIcon = useCallback(() => {
    stop()
    play()
  }, [play, stop])

  return (
    <>
      {pronunciationIsOpen && (
        <Tooltip content="朗读发音（Ctrl + J）" className={`${styles.wordSound}`}>
          <SoundIcon animated={isPlaying} {...rest} onClick={handleClickSoundIcon} />
        </Tooltip>
      )}
    </>
  )
}

export type WordSoundProps = {
  word: string
  inputWord: string
} & SoundIconProps

export default WordSound
