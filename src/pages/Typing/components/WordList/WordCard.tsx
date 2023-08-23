import { SoundIcon } from '../WordPanel/components/SoundIcon'
import styles from './wordcard.module.css'
import usePronunciationSound from '@/hooks/usePronunciation'
import type { Word } from '@/typings'
import { useCallback } from 'react'

export default function WordCard({ word, isActive }: { word: Word; isActive: boolean }) {
  const { play, stop, isPlaying } = usePronunciationSound(word.name)

  const handleClickSoundIcon = useCallback(() => {
    stop()
    play()
  }, [play, stop])
  return (
    <div
      className={`mb-2 cursor-pointer rounded-xl ${
        isActive ? 'bg-indigo-50 dark:bg-indigo-800 dark:bg-opacity-20' : 'bg-white dark:bg-gray-700 dark:bg-opacity-20'
      }   relative select-text p-4 shadow focus:outline-none`}
      key={word.name}
      onClick={handleClickSoundIcon}
    >
      <p className="select-all font-mono text-xl font-normal leading-6 dark:text-gray-50">{word.name}</p>
      <div className="mt-2 max-w-sm font-sans text-sm text-gray-400">{word.trans}</div>
      <div className={`${styles.wordSound}`}>
        <SoundIcon animated={isPlaying} onClick={handleClickSoundIcon} />
      </div>
    </div>
  )
}
