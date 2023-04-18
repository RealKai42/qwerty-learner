import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * React hook for using the SpeechSynthesis API.
 * @param {string} text The text to be spoken.
 * @param {Partial<SpeechSynthesisUtterance>} option SpeechSynthesisUtterance API option. {@link https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance#instance_properties}
 * @returns {Object} An object containing `speak`, `cancel` methods and `speaking` state.
 * @throws {Error} If browser not support SpeechSynthesis API.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API}
 */
const useSpeech = (text: string, option?: Partial<SpeechSynthesisUtterance>) => {
  const [speaking, setSpeaking] = useState(false)
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const optionRef = useRef(option)

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) {
      throw new Error('SpeechSynthesis API is not supported in this browser')
    }

    const newUtterance = new SpeechSynthesisUtterance(text)
    Object.assign(newUtterance, optionRef.current)
    setUtterance(newUtterance)

    return () => {
      if (speaking) {
        synth.cancel()
        setSpeaking(false)
      }
    }
  }, [text, speaking])

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

  /**
   * Speak
   * @param {boolean} [abort=false] Whether to cancel other speak
   */
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

export default useSpeech
