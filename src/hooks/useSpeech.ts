import { useCallback, useEffect, useRef, useState } from 'react'

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text)
}

function chineseVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  return synth.getVoices().find((voice) => voice.lang.toLowerCase().replace('_', '-').startsWith('zh'))
}

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
  const sessionRef = useRef(0)
  const restartTimerRef = useRef<number | null>(null)

  const invalidate = useCallback((synth: SpeechSynthesis | undefined) => {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    sessionRef.current += 1
    synth?.cancel()
  }, [])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      console.error('SpeechSynthesis API is not supported in this browser')
      return
    }

    return () => {
      invalidate(synth)
      setSpeaking(false)
    }
  }, [invalidate, option, text])

  const speak = useCallback(
    (abort = false) => {
      const synth = window.speechSynthesis
      if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return

      const start = () => {
        const session = ++sessionRef.current
        const speakNow = () => {
          if (sessionRef.current !== session) return

          const utterance = new SpeechSynthesisUtterance(text)
          if (option) Object.assign(utterance, option)
          if (containsChinese(text)) {
            utterance.lang = 'zh-CN'
            const voice = chineseVoice(synth)
            if (voice) utterance.voice = voice
          }

          // end/error from a cancelled utterance belong to an older session.
          const stop = () => {
            if (sessionRef.current !== session) return
            setSpeaking(false)
          }
          utterance.addEventListener('end', stop)
          utterance.addEventListener('error', stop)

          setSpeaking(true)
          synth.speak(utterance)
        }

        // Chrome fills getVoices() only after voiceschanged. Speaking before
        // that uses the default voice and often drops Chinese text.
        if (containsChinese(text) && synth.getVoices().length === 0) {
          let started = false
          const once = () => {
            if (started) return
            started = true
            synth.removeEventListener('voiceschanged', once)
            speakNow()
          }
          synth.addEventListener('voiceschanged', once)
          window.setTimeout(once, 300)
          return
        }

        speakNow()
      }

      if (abort && (synth.speaking || synth.pending)) {
        // cancel() does not emit end. Some browsers also drop a speak()
        // issued in the same turn, so restart on the next turn.
        invalidate(synth)
        setSpeaking(true)
        restartTimerRef.current = window.setTimeout(() => {
          restartTimerRef.current = null
          start()
        }, 0)
        return
      }

      start()
    },
    [invalidate, option, text],
  )

  const cancel = useCallback(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    invalidate(synth)
    setSpeaking(false)
  }, [invalidate])

  return {
    speak,
    cancel,
    speaking,
  }
}
