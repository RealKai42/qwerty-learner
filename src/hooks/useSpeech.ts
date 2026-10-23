import { useCallback, useEffect, useRef, useState } from 'react'

export type UseSpeechResult = { speak: (abort?: boolean) => void; cancel: () => void; speaking: boolean; available: boolean }
let activeUtterance: SpeechSynthesisUtterance | undefined

export default function useSpeech(text: string, option?: Partial<SpeechSynthesisUtterance> & { loop?: boolean }): UseSpeechResult {
  const [speaking, setSpeaking] = useState(false)
  const owned = useRef<SpeechSynthesisUtterance>()
  const options = useRef(option)
  options.current = option
  const available = typeof window.speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined'
  const cancel = useCallback(() => {
    if (owned.current && activeUtterance === owned.current) {
      activeUtterance = undefined
      window.speechSynthesis?.cancel()
    }
    owned.current = undefined
    setSpeaking(false)
  }, [])
  const speak = useCallback(
    (abort = false) => {
      if (!available || !text) return
      if (abort) window.speechSynthesis.cancel()
      const start = () => {
        const utterance = new SpeechSynthesisUtterance(text)
        const { loop: _loop, ...properties } = options.current ?? {}
        void _loop
        Object.assign(utterance, properties)
        owned.current = utterance
        activeUtterance = utterance
        const finish = () => {
          if (activeUtterance !== utterance) return
          activeUtterance = undefined
          owned.current = undefined
          setSpeaking(false)
        }
        utterance.onend = () => {
          if (activeUtterance !== utterance) return
          if (options.current?.loop) start()
          else finish()
        }
        utterance.onerror = finish
        setSpeaking(true)
        window.speechSynthesis.speak(utterance)
      }
      start()
    },
    [text, available],
  )
  useEffect(() => cancel, [text, cancel])
  return { speak, cancel, speaking, available }
}
