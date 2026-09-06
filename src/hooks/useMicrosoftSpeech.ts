import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type UseMicrosoftSpeechOptions = {
  lang?: string
  volume?: number
  rate?: number
  pitch?: number
  preferredVoiceNames?: string[]
}

export type UseMicrosoftSpeechResult = {
  speak: (abort?: boolean) => void
  cancel: () => void
  speaking: boolean
  isSupported: boolean
}

const DEFAULT_MICROSOFT_VOICES = [
  'Microsoft Aria Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Aria',
  'Microsoft Zira',
  'Microsoft David',
  'Google US English',
]

function pickVoice(voices: SpeechSynthesisVoice[], lang: string, preferred: string[]): SpeechSynthesisVoice | null {
  const sameLang = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
  const pool = sameLang.length > 0 ? sameLang : voices

  for (const name of preferred) {
    const hit = pool.find((v) => v.name === name)
    if (hit) return hit
  }
  const microsoft = pool.find((v) => /microsoft/i.test(v.name))
  if (microsoft) return microsoft
  return pool[0] ?? null
}

export default function useMicrosoftSpeech(text: string, option: UseMicrosoftSpeechOptions = {}): UseMicrosoftSpeechResult {
  const { lang = 'en-US', volume = 1, rate = 1, pitch = 1, preferredVoiceNames = DEFAULT_MICROSOFT_VOICES } = option

  const isSupported = typeof window !== 'undefined' && !!window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined'

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!isSupported) return
    const synth = window.speechSynthesis
    const loadVoices = () => setVoices(synth.getVoices())
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    return () => synth.removeEventListener('voiceschanged', loadVoices)
  }, [isSupported])

  const voice = useMemo(() => {
    if (voices.length === 0) return null
    return pickVoice(voices, lang, preferredVoiceNames)
  }, [voices, lang, preferredVoiceNames])

  const speak = useCallback(
    (abort = false) => {
      if (!isSupported || !text) return
      const synth = window.speechSynthesis
      if (abort && synth.speaking) synth.cancel()

      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = lang
      utter.volume = volume
      utter.rate = rate
      utter.pitch = pitch
      if (voice) utter.voice = voice

      utter.addEventListener('end', () => setSpeaking(false))
      utter.addEventListener('error', () => setSpeaking(false))

      utteranceRef.current = utter
      setSpeaking(true)
      synth.speak(utter)
    },
    [isSupported, text, lang, volume, rate, pitch, voice],
  )

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [isSupported])

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel()
    }
  }, [isSupported])

  return { speak, cancel, speaking, isSupported }
}
