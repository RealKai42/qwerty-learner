import { useCallback, useEffect, useState } from 'react'

export type UseSpeechResult = {
  /**
   * Speak speaking
   * @param {boolean} [abort=false] Whether to cancel other speak
   */
  speak: (abort?: boolean) => void
  /**
   * Cancel speaking
   */
  cancel: () => void
  /**
   * Whether currently speaking
   */
  speaking: boolean
}

/**
 * React hook for using the SpeechSynthesis API.
 * @param {string} text The text to be spoken.
 * @param {Partial<SpeechSynthesisUtterance>} option SpeechSynthesisUtterance API option. {@link https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance#instance_properties}
 * @returns {Object} An object containing `speak`, `cancel` methods and `speaking` state.
 * @throws {Error} If browser not support SpeechSynthesis API.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API}
 */
export default function useSpeech(text: string, option?: Partial<SpeechSynthesisUtterance>): UseSpeechResult {
  const [speaking, setSpeaking] = useState(false)
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      console.error('SpeechSynthesis API is not supported in this browser')
      return
    }

    const newUtterance = new SpeechSynthesisUtterance(text)
    Object.assign(newUtterance, option)
    setUtterance(newUtterance)

    return () => {
      synth.cancel()
      setSpeaking(false)
    }
  }, [option, text])

  useEffect(() => {
    if (utterance) {
      const onend = () => {
        setSpeaking(false)
      }
      utterance.addEventListener('end', onend)
      return () => {
        utterance.removeEventListener('end', onend)
      }
    }
  }, [utterance])

  const speak = useCallback(
    (abort = false) => {
      if (utterance) {
        const synth = window.speechSynthesis
        if (abort && synth.speaking) {
          synth.cancel()
        }
        setSpeaking(true)
        synth.speak(utterance)
      }
    },
    [utterance],
  )

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
