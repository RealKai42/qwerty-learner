import type { SoundIconProps } from '../SoundIcon'
import { SoundIcon } from '../SoundIcon'
import styles from './index.module.css'
import Tooltip from '@/components/Tooltip'
import usePronunciationSound from '@/hooks/usePronunciation'
import { pronunciationIsOpenAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const WordSound = ({ word, inputWord, ...rest }: WordSoundProps) => {
  const { play, stop, isPlaying } = usePronunciationSound(word)
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)

  useHotkeys(
    'ctrl+j',
    () => {
      stop()
      play()
    },
    [play, stop],
    { enableOnFormTags: true, preventDefault: true },
  )

  useEffect(() => {
    if (inputWord.length === 0) {
      stop()
      play()
    }
  }, [play, inputWord, stop])

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
