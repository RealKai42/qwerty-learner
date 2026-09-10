import usePronunciationSound from '@/hooks/usePronunciation'
import { wordCompletionPauseConfigAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface WordCompletionPauseProps {
  word: Word
  isVisible: boolean
  onComplete: () => void
}

export default function WordCompletionPause({ word, isVisible, onComplete }: WordCompletionPauseProps) {
  const config = useAtomValue(wordCompletionPauseConfigAtom)
  const [shouldShow, setShouldShow] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const { play: playPronunciation, stop: stopPronunciation } = usePronunciationSound(word.name, true) // Loop pronunciation

  useEffect(() => {
    if (!config.isEnabled || !isVisible) {
      setShouldShow(false)
      stopPronunciation()
      return
    }

    setShouldShow(true)
    setTimeLeft(config.duration)

    // Start pronunciation if enabled
    if (config.playPronunciation) {
      const pronunciationTimer = setTimeout(() => {
        playPronunciation()
      }, 100) // Small delay to ensure smooth display

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 100
        })
      }, 100)

      // Auto-complete after configured duration
      const completeTimer = setTimeout(() => {
        setShouldShow(false)
        stopPronunciation()
        onComplete()
      }, config.duration)

      return () => {
        clearTimeout(pronunciationTimer)
        clearTimeout(completeTimer)
        clearInterval(countdownInterval)
        stopPronunciation()
      }
    } else {
      // Countdown timer without pronunciation
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 100
        })
      }, 100)

      // Auto-complete after configured duration (without pronunciation)
      const completeTimer = setTimeout(() => {
        setShouldShow(false)
        onComplete()
      }, config.duration)

      return () => {
        clearTimeout(completeTimer)
        clearInterval(countdownInterval)
      }
    }
  }, [config.isEnabled, config.duration, config.playPronunciation, isVisible, word.name, playPronunciation, stopPronunciation, onComplete])

  if (!shouldShow) {
    return null
  }

  const progressPercentage = ((config.duration - timeLeft) / config.duration) * 100
  const translation = word.trans.join('；')

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-200">
      <div
        className="mx-4 max-w-md transform rounded-lg bg-white p-8 shadow-2xl transition-all duration-300 ease-out dark:bg-gray-800"
        style={{
          animation: shouldShow ? 'slideInUp 0.3s ease-out' : 'slideOutDown 0.3s ease-in',
        }}
      >
        <div className="text-center">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{word.name}</h3>
          </div>
          <div className="mb-6">
            <p className="text-xl text-gray-600 dark:text-gray-300">{translation}</p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{Math.ceil(timeLeft / 1000)}s remaining</p>
          </div>

          {config.playPronunciation && (
            <div className="flex items-center justify-center">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.846l3.537-3.816a1 1 0 011.617.816zM16 8a2 2 0 11-4 0 2 2 0 014 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Playing pronunciation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
