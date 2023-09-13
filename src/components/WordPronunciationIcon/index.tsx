import { SoundIcon } from './SoundIcon'
import usePronunciationSound from '@/hooks/usePronunciation'
import { useCallback, useEffect, useImperativeHandle } from 'react'
import React from 'react'

export const WordPronunciationIcon = React.forwardRef<
  WordPronunciationIconRef,
  { word: string; className?: string; iconClassName?: string }
>(({ word, className, iconClassName }, ref) => {
  const { stop, isPlaying, setIsPlaying } = usePronunciationSound(word)

  const playSound = useCallback(() => {
    setIsPlaying(true)
  }, [setIsPlaying])

  useEffect(() => {
    return stop
  }, [word, stop])

  useImperativeHandle(
    ref,
    () => ({
      play: playSound,
    }),
    [playSound],
  )

  return (
    <SoundIcon
      animated={isPlaying}
      onClick={playSound}
      className={`cursor-pointer text-gray-600 ${className}`}
      iconClassName={iconClassName}
    />
  )
})

WordPronunciationIcon.displayName = 'WordPronunciationIcon'

export type WordPronunciationIconRef = {
  play: () => void
}
