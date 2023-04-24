import VolumeHighIcon from './volume-icons/VolumeHieghIcon'
import VolumeIcon from './volume-icons/VolumeIcon'
import VolumeLowIcon from './volume-icons/VolumeLowIcon'
import VolumeMediumIcon from './volume-icons/VolumeMediumIcon'
import React, { useEffect, useState } from 'react'

const volumeIcons = [VolumeIcon, VolumeLowIcon, VolumeMediumIcon, VolumeHighIcon]

export const SoundIcon = ({ duration = 500, animated = false, ...rest }: SoundIconProps) => {
  const [animationFrameIndex, setAnimationFrameIndex] = useState(0)

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

  useEffect(() => {
    if (!animated) {
      const timer = setTimeout(() => {
        setAnimationFrameIndex(0)
      }, duration)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated])

  const Icon = volumeIcons[animationFrameIndex]

  return <Icon {...rest} />
}

export type SoundIconProps = {
  animated?: boolean
  duration?: number
} & Omit<React.SVGProps<SVGSVGElement>, 'ref'>

export type SoundIconRef = {
  playAnimation(): void
  stopAnimation(): void
}
