import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react'
import VolumeIcon from './volume-icons/VolumeIcon'
import VolumeLowIcon from './volume-icons/VolumeLowIcon'
import VolumeMediumIcon from './volume-icons/VolumeMediumIcon'
import VolumeHighIcon from './volume-icons/VolumeHieghIcon'

const volumeIcons = [VolumeIcon, VolumeLowIcon, VolumeMediumIcon, VolumeHighIcon]

export const SoundIcon = React.forwardRef<SoundIconRef, SoundIconProps>(({ duration = 500, ...rest }, ref) => {
  const [animationFrameIndex, setAnimationFrameIndex] = useState(0)
  const [animated, setAnimated] = useState(false)

  const playAnimation = useCallback(() => {
    if (animated) {
      return
    }
    setAnimationFrameIndex(0)
    setAnimated(true)
  }, [animated])
  const stopAnimation = useCallback(() => {
    setAnimationFrameIndex(0)
    setAnimated(false)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      playAnimation,
      stopAnimation,
    }),
    [playAnimation, stopAnimation],
  )

  useEffect(() => {
    if (animated) {
      const timer = window.setTimeout(() => {
        const index = animationFrameIndex < volumeIcons.length - 1 ? animationFrameIndex + 1 : 0
        setAnimationFrameIndex(index)
      }, duration)
      return () => {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, animationFrameIndex])

  const Icon = volumeIcons[animationFrameIndex]

  return <Icon {...rest} />
})

export type SoundIconProps = {
  duration?: number
} & Omit<React.SVGProps<SVGSVGElement>, 'ref'>

export type SoundIconRef = {
  playAnimation(): void
  stopAnimation(): void
}
