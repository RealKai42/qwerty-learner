import { SoundIcon, SoundIconProps } from '../SoundIcon'
import Tooltip from '@/components/Tooltip'
import usePronunciationSound from '@/hooks/usePronunciation'
import { useAtomValue } from 'jotai'
import { useEffect, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import style from './index.module.css'
import { pronunciationIsOpenAtom } from '@/store'

const WordSound = ({ word, inputWord, ...rest }: WordSoundProps) => {
  const { play, stop, isPlaying } = usePronunciationSound(word)
  const pronunciationIsOpen = useAtomValue(pronunciationIsOpenAtom)

  useHotkeys(
    'ctrl+j',
    (e) => {
      e.preventDefault()
      stop()
      play()
    },
    [play, stop],
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
        <Tooltip content="朗读发音（Ctrl + J）" className={`${style['word-sound']}`}>
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
