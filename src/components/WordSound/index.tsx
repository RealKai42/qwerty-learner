import { SoundIcon, SoundIconProps } from '@/components/SoundIcon'
import Tooltip from '@/components/Tooltip'
import usePronunciationSound from '@/hooks/usePronunciation'
import { useEffect, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const WordSound = ({ word, className, inputWord, ...rest }: WordSoundProps) => {
  const { play, stop, isPlaying } = usePronunciationSound(word)

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
    <Tooltip content="朗读发音（Ctrl + J）" className={className}>
      <SoundIcon animated={isPlaying} {...rest} onClick={handleClickSoundIcon} />
    </Tooltip>
  )
}

export type WordSoundProps = {
  word: string
  inputWord: string
} & SoundIconProps

export default WordSound
