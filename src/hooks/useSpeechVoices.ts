import { useCallback, useEffect, useState } from 'react'

export type SpeechVoiceLoadStatus = 'unsupported' | 'loading' | 'ready'

export type SpeechVoicesResult = {
  voices: SpeechSynthesisVoice[]
  status: SpeechVoiceLoadStatus
  refresh: () => void
}

export default function useSpeechVoices(): SpeechVoicesResult {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [status, setStatus] = useState<SpeechVoiceLoadStatus>(supported ? 'loading' : 'unsupported')
  const [attempt, setAttempt] = useState(0)

  const refresh = useCallback(() => {
    if (!supported) return
    setStatus('loading')
    setAttempt((value) => value + 1)
  }, [supported])

  useEffect(() => {
    if (!supported) {
      setStatus('unsupported')
      return
    }

    const synth = window.speechSynthesis
    let settled = false

    const updateVoices = () => {
      const nextVoices = synth.getVoices()
      setVoices(nextVoices)
      if (nextVoices.length > 0 || settled) {
        setStatus('ready')
      }
    }

    const handleVoicesChanged = () => {
      settled = true
      updateVoices()
    }

    updateVoices()
    synth.addEventListener('voiceschanged', handleVoicesChanged)
    const earlyRetry = window.setTimeout(updateVoices, 250)
    const finalRetry = window.setTimeout(() => {
      settled = true
      updateVoices()
    }, 2000)

    return () => {
      window.clearTimeout(earlyRetry)
      window.clearTimeout(finalRetry)
      synth.removeEventListener('voiceschanged', handleVoicesChanged)
    }
  }, [attempt, supported])

  return { voices, status, refresh }
}
