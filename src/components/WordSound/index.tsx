import { SoundIcon, SoundIconProps, SoundIconRef } from 'components/SoundIcon'
import usePronunciationSound from 'hooks/usePronunciation'
import React, { useEffect, useRef, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const WordSound: React.FC<WordSoundProps> = React.memo(({ word, inputWord, ...rest }) => {
  const soundIconRef = useRef<SoundIconRef>(null)
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

  useEffect(() => {
    const soundIcon = soundIconRef.current

    isPlaying ? soundIcon?.playAnimation() : soundIcon?.stopAnimation()

    return () => {
      soundIcon?.stopAnimation()
    }
  }, [isPlaying])

  return <SoundIcon ref={soundIconRef} {...rest} onClick={handleClickSoundIcon} />
})

export type WordSoundProps = {
  word: string
  inputWord: string
} & SoundIconProps

export default WordSound
