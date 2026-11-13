import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const VALID_UTTERANCE_PROPS = ['lang', 'voice', 'volume', 'rate', 'pitch'] as const

export type UseSpeechResult = {
  speak: (abort?: boolean) => void
  cancel: () => void
  speaking: boolean
}

export default function useSpeech(text: string, option?: Partial<SpeechSynthesisUtterance>): UseSpeechResult {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const optionJson = useMemo(() => JSON.stringify(option), [option])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      console.error('SpeechSynthesis API is not supported in this browser')
      return
    }

    const newUtterance = new SpeechSynthesisUtterance(text)
    if (option) {
      for (const prop of VALID_UTTERANCE_PROPS) {
        if (prop in option) {
          ;(newUtterance as unknown as Record<string, unknown>)[prop] = option[prop]
        }
      }
    }
    const handleEnd = () => setSpeaking(false)
    newUtterance.addEventListener('end', handleEnd)
    utteranceRef.current = newUtterance

    return () => {
      newUtterance.removeEventListener('end', handleEnd)
      synth.cancel()
      setSpeaking(false)
      utteranceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, optionJson])

  const speak = useCallback((abort = false) => {
    const utterance = utteranceRef.current
    if (!utterance) return
    const synth = window.speechSynthesis
    if (abort && synth.speaking) {
      synth.cancel()
    }
    setSpeaking(true)
    synth.speak(utterance)
  }, [])

  const cancel = useCallback(() => {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
    }
  }, [speaking])

  return {
    speak,
    cancel,
    speaking,
  }
}
