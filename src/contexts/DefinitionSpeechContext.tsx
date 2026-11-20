import useSpeechVoices from '@/hooks/useSpeechVoices'
import type { SpeechVoiceLoadStatus } from '@/hooks/useSpeechVoices'
import { pronunciationConfigAtom } from '@/store'
import { registerDefinitionCancel, stopWordPlayback } from '@/utils/audioPlaybackCoordinator'
import { getCantoneseVoices } from '@/utils/cantoneseVoice'
import stripPartOfSpeech from '@/utils/stripPartOfSpeech'
import { useAtomValue } from 'jotai'
import type { PropsWithChildren } from 'react'
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type DefinitionSpeechContextValue = {
  speak: (text: string, speechId: string) => boolean
  cancel: () => void
  clearError: () => void
  speakingId: string | null
  error: string | null
  voices: SpeechSynthesisVoice[]
  cantoneseVoices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  voiceStatus: SpeechVoiceLoadStatus
  refreshVoices: () => void
}

const DefinitionSpeechContext = createContext<DefinitionSpeechContextValue | null>(null)

function isExpectedCancellation(error: string): boolean {
  return error === 'canceled' || error === 'cancelled' || error === 'interrupted'
}

export function DefinitionSpeechProvider({ children, scopeKey }: PropsWithChildren<{ scopeKey: string }>) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const { voices, status: voiceStatus, refresh: refreshVoices } = useSpeechVoices()
  const cantoneseVoices = useMemo(() => getCantoneseVoices(voices), [voices])
  const selectedVoice = useMemo(
    () => cantoneseVoices.find((voice) => voice.voiceURI === pronunciationConfig.transVoiceURI) ?? null,
    [cantoneseVoices, pronunciationConfig.transVoiceURI],
  )
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const taskId = useRef(0)

  const cancel = useCallback(() => {
    taskId.current += 1
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeakingId(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const speak = useCallback(
    (text: string, speechId: string) => {
      if (!text.trim()) {
        setError('当前释义为空，无法朗读')
        return false
      }

      if (voiceStatus === 'unsupported') {
        setError('当前浏览器不支持网页语音')
        return false
      }

      let voice: SpeechSynthesisVoice | null = null
      if (pronunciationConfig.transSpeechMode === 'cantonese') {
        if (voiceStatus === 'loading') {
          setError('正在读取浏览器声音，请稍后重试')
          return false
        }
        if (!pronunciationConfig.transVoiceURI) {
          if (cantoneseVoices.length === 0) {
            setError('没有找到可用粤语声音，已阻止普通话回退')
            return false
          }
          setError('请先在音效设置中选择粤语声音')
          return false
        }
        if (!selectedVoice) {
          setError('原声音当前不可用，请重新选择')
          return false
        }
        voice = selectedVoice
      }

      const synth = window.speechSynthesis
      const currentTask = taskId.current + 1
      taskId.current = currentTask
      synth.cancel()
      stopWordPlayback()

      const speechText = pronunciationConfig.transSpeechMode === 'cantonese' ? stripPartOfSpeech(text) : text
      const utterance = new SpeechSynthesisUtterance(speechText)
      utterance.volume = pronunciationConfig.transVolume
      utterance.rate = pronunciationConfig.transRate
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      }

      utterance.onend = () => {
        if (taskId.current !== currentTask) return
        setSpeakingId(null)
      }
      utterance.onerror = (event) => {
        if (taskId.current !== currentTask) return
        setSpeakingId(null)
        if (!isExpectedCancellation(event.error)) {
          setError(`释义发音失败（${event.error || '未知错误'}），请重试`)
        }
      }

      setError(null)
      setSpeakingId(speechId)
      try {
        synth.speak(utterance)
        return true
      } catch (speechError) {
        if (taskId.current === currentTask) {
          setSpeakingId(null)
          setError(`释义发音失败（${speechError instanceof Error ? speechError.message : '未知错误'}），请重试`)
        }
        return false
      }
    },
    [cantoneseVoices.length, pronunciationConfig, selectedVoice, voiceStatus],
  )

  useEffect(() => registerDefinitionCancel(cancel), [cancel])

  useLayoutEffect(() => {
    cancel()
    setError(null)
  }, [
    cancel,
    pronunciationConfig.isTransRead,
    pronunciationConfig.transRate,
    pronunciationConfig.transSpeechMode,
    pronunciationConfig.transVoiceURI,
    pronunciationConfig.transVolume,
    scopeKey,
  ])

  useEffect(() => {
    return () => {
      taskId.current += 1
      window.speechSynthesis?.cancel()
    }
  }, [])

  const value = useMemo<DefinitionSpeechContextValue>(
    () => ({
      speak,
      cancel,
      clearError,
      speakingId,
      error,
      voices,
      cantoneseVoices,
      selectedVoice,
      voiceStatus,
      refreshVoices,
    }),
    [cancel, cantoneseVoices, clearError, error, refreshVoices, selectedVoice, speak, speakingId, voiceStatus, voices],
  )

  return <DefinitionSpeechContext.Provider value={value}>{children}</DefinitionSpeechContext.Provider>
}

export function useDefinitionSpeech(): DefinitionSpeechContextValue {
  const value = useContext(DefinitionSpeechContext)
  if (!value) {
    throw new Error('useDefinitionSpeech must be used within DefinitionSpeechProvider')
  }
  return value
}
