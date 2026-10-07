import styles from './index.module.css'
import { useDefinitionSpeech } from '@/contexts/DefinitionSpeechContext'
import { keySoundResources } from '@/resources/soundResource'
import { hintSoundsConfigAtom, keySoundsConfigAtom, pronunciationConfigAtom } from '@/store'
import type { SoundResource } from '@/typings'
import { toFixedNumber } from '@/utils'
import { playKeySoundResource } from '@/utils/sounds/keySounds'
import { Listbox, Switch, Transition } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import type { ChangeEvent } from 'react'
import { Fragment, useCallback } from 'react'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconEar from '~icons/tabler/ear'

export default function SoundSetting() {
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const [keySoundsConfig, setKeySoundsConfig] = useAtom(keySoundsConfigAtom)
  const [hintSoundsConfig, setHintSoundsConfig] = useAtom(hintSoundsConfigAtom)
  const {
    cantoneseVoices,
    selectedVoice,
    voiceStatus,
    refreshVoices,
    speak: speakDefinition,
    speakingId,
    error: speechError,
    clearError: clearSpeechError,
  } = useDefinitionSpeech()

  const onTogglePronunciation = useCallback(
    (checked: boolean) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setPronunciationConfig],
  )
  const onTogglePronunciationIsTransRead = useCallback(
    (checked: boolean) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        isTransRead: checked,
      }))
    },
    [setPronunciationConfig],
  )
  const onChangePronunciationVolume = useCallback(
    (value: [number]) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        volume: value[0] / 100,
      }))
    },
    [setPronunciationConfig],
  )
  const onChangePronunciationIsTransVolume = useCallback(
    (value: [number]) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        transVolume: value[0] / 100,
      }))
    },
    [setPronunciationConfig],
  )
  const onChangePronunciationTransRate = useCallback(
    (value: [number]) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        transRate: value[0],
      }))
    },
    [setPronunciationConfig],
  )
  const onChangeTransSpeechMode = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const transSpeechMode = event.target.value as 'system' | 'cantonese'
      clearSpeechError()
      setPronunciationConfig((prev) => {
        const firstVoice = cantoneseVoices[0]
        if (transSpeechMode === 'cantonese' && !prev.transVoiceURI && firstVoice) {
          return {
            ...prev,
            transSpeechMode,
            transVoiceURI: firstVoice.voiceURI,
            transVoiceName: firstVoice.name,
            transVoiceLang: firstVoice.lang,
          }
        }
        return { ...prev, transSpeechMode }
      })
    },
    [cantoneseVoices, clearSpeechError, setPronunciationConfig],
  )
  const onChangeTransVoice = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const voice = cantoneseVoices.find((item) => item.voiceURI === event.target.value)
      if (!voice) return
      clearSpeechError()
      setPronunciationConfig((prev) => ({
        ...prev,
        transVoiceURI: voice.voiceURI,
        transVoiceName: voice.name,
        transVoiceLang: voice.lang,
      }))
    },
    [cantoneseVoices, clearSpeechError, setPronunciationConfig],
  )
  const onPreviewDefinition = useCallback(() => {
    speakDefinition('环境，发展，教育，研究', 'settings-preview')
  }, [speakDefinition])
  const onChangePronunciationRate = useCallback(
    (value: [number]) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        rate: value[0],
      }))
    },
    [setPronunciationConfig],
  )

  const onToggleKeySounds = useCallback(
    (checked: boolean) => {
      setKeySoundsConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setKeySoundsConfig],
  )
  const onChangeKeySoundsVolume = useCallback(
    (value: [number]) => {
      setKeySoundsConfig((prev) => ({
        ...prev,
        volume: value[0] / 100,
      }))
    },
    [setKeySoundsConfig],
  )

  const onChangeKeySoundsResource = useCallback(
    (key: string) => {
      const soundResource = keySoundResources.find((item: SoundResource) => item.key === key) as SoundResource
      if (!soundResource) return

      setKeySoundsConfig((prev) => ({
        ...prev,
        resource: soundResource,
      }))
    },
    [setKeySoundsConfig],
  )

  const onPlayKeySound = useCallback((soundResource: SoundResource) => {
    playKeySoundResource(soundResource)
  }, [])

  const onToggleHintSounds = useCallback(
    (checked: boolean) => {
      setHintSoundsConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setHintSoundsConfig],
  )
  const onChangeHintSoundsVolume = useCallback(
    (value: [number]) => {
      setHintSoundsConfig((prev) => ({
        ...prev,
        volume: value[0] / 100,
      }))
    },
    [setHintSoundsConfig],
  )

  const isSavedVoiceMissing = Boolean(
    pronunciationConfig.transSpeechMode === 'cantonese' && pronunciationConfig.transVoiceURI && !selectedVoice,
  )
  let transVoiceStatusText = '跟随系统模式使用浏览器当前默认声音'
  if (pronunciationConfig.transSpeechMode === 'cantonese') {
    if (voiceStatus === 'unsupported') {
      transVoiceStatusText = '当前浏览器不支持网页语音'
    } else if (voiceStatus === 'loading') {
      transVoiceStatusText = '正在读取浏览器声音'
    } else if (isSavedVoiceMissing) {
      transVoiceStatusText = '原声音当前不可用，请重新选择'
    } else if (cantoneseVoices.length === 0) {
      transVoiceStatusText = '没有找到可用粤语声音，不会改用普通话'
    } else if (!selectedVoice) {
      transVoiceStatusText = '请选择粤语声音'
    } else {
      transVoiceStatusText = selectedVoice.localService ? `本地声音 ${selectedVoice.lang}` : `此声音需要联网 ${selectedVoice.lang}`
    }
  }

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>单词发音</span>
            <div className={styles.switchBlock}>
              <Switch checked={pronunciationConfig.isOpen} onChange={onTogglePronunciation} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                pronunciationConfig.isOpen ? '开启' : '关闭'
              }`}</span>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>音量</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  defaultValue={[pronunciationConfig.volume * 100]}
                  max={100}
                  step={10}
                  className="slider"
                  onValueChange={onChangePronunciationVolume}
                  disabled={!pronunciationConfig.isOpen}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${Math.floor(pronunciationConfig.volume * 100)}%`}</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>倍速</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  defaultValue={[pronunciationConfig.rate ?? 1]}
                  max={4}
                  min={0.5}
                  step={0.1}
                  className="slider"
                  onValueChange={onChangePronunciationRate}
                  disabled={!pronunciationConfig.isOpen}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${toFixedNumber(pronunciationConfig.rate, 2)}`}</span>
              </div>
            </div>
          </div>
          {window.speechSynthesis && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>释义发音</span>
              <div className={styles.switchBlock}>
                <Switch checked={pronunciationConfig.isTransRead} onChange={onTogglePronunciationIsTransRead} className="switch-root">
                  <span aria-hidden="true" className="switch-thumb" />
                </Switch>
                <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                  pronunciationConfig.isTransRead ? '开启' : '关闭'
                }`}</span>
              </div>
              <div className={styles.block}>
                <span className={styles.blockLabel}>模式</span>
                <select
                  aria-label="释义发音模式"
                  value={pronunciationConfig.transSpeechMode}
                  onChange={onChangeTransSpeechMode}
                  className="w-60 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="system">跟随系统</option>
                  <option value="cantonese">粤语</option>
                </select>
              </div>
              {pronunciationConfig.transSpeechMode === 'cantonese' && (
                <div className={styles.block}>
                  <span className={styles.blockLabel}>粤语声音</span>
                  <select
                    aria-label="粤语声音"
                    value={selectedVoice?.voiceURI ?? pronunciationConfig.transVoiceURI}
                    onChange={onChangeTransVoice}
                    disabled={voiceStatus !== 'ready' || cantoneseVoices.length === 0}
                    className="w-60 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-indigo-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {!pronunciationConfig.transVoiceURI && <option value="">请选择粤语声音</option>}
                    {isSavedVoiceMissing && (
                      <option value={pronunciationConfig.transVoiceURI}>{`${
                        pronunciationConfig.transVoiceName || '原声音'
                      }（不可用）`}</option>
                    )}
                    {cantoneseVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>{`${voice.name}（${voice.lang}）`}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className={styles.block}>
                <span className={styles.blockLabel}>声音状态</span>
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-300" role="status">
                    {transVoiceStatusText}
                  </span>
                  <button
                    type="button"
                    onClick={refreshVoices}
                    className="min-w-max rounded px-2 py-1 text-xs text-indigo-500 hover:bg-indigo-50 focus:outline-none dark:hover:bg-indigo-900"
                  >
                    重新读取
                  </button>
                </div>
                {speechError && <span className="text-xs text-red-500">{speechError}</span>}
                <button
                  type="button"
                  onClick={onPreviewDefinition}
                  disabled={
                    voiceStatus === 'unsupported' ||
                    (pronunciationConfig.transSpeechMode === 'cantonese' && (!selectedVoice || voiceStatus !== 'ready'))
                  }
                  className="rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {speakingId === 'settings-preview'
                    ? '正在试听'
                    : pronunciationConfig.transSpeechMode === 'cantonese'
                    ? '试听粤语'
                    : '试听系统声音'}
                </button>
              </div>
              <div className={styles.block}>
                <span className={styles.blockLabel}>音量</span>
                <div className="flex h-5 w-full items-center justify-between">
                  <Slider.Root
                    defaultValue={[pronunciationConfig.transVolume * 100]}
                    max={100}
                    step={10}
                    className="slider"
                    onValueChange={onChangePronunciationIsTransVolume}
                  >
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb />
                  </Slider.Root>
                  <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${Math.floor(
                    pronunciationConfig.transVolume * 100,
                  )}%`}</span>
                </div>
              </div>
              <div className={styles.block}>
                <span className={styles.blockLabel}>释义语速</span>
                <div className="flex h-5 w-full items-center justify-between">
                  <Slider.Root
                    value={[pronunciationConfig.transRate]}
                    max={1.2}
                    min={0.7}
                    step={0.1}
                    className="slider"
                    onValueChange={onChangePronunciationTransRate}
                  >
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb />
                  </Slider.Root>
                  <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${toFixedNumber(
                    pronunciationConfig.transRate,
                    1,
                  )}`}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <span className={styles.sectionLabel}>按键音</span>
            <div className={styles.switchBlock}>
              <Switch checked={keySoundsConfig.isOpen} onChange={onToggleKeySounds} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                keySoundsConfig.isOpen ? '开启' : '关闭'
              }`}</span>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>音量</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  defaultValue={[keySoundsConfig.volume * 100]}
                  max={100}
                  min={1}
                  step={10}
                  className="slider"
                  onValueChange={onChangeKeySoundsVolume}
                  disabled={!keySoundsConfig.isOpen}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${Math.floor(keySoundsConfig.volume * 100)}%`}</span>
              </div>
            </div>
            <div className={`${styles.block}`}>
              <span className={styles.blockLabel}>按键音效</span>
              <Listbox value={keySoundsConfig.resource.key} onChange={onChangeKeySoundsResource}>
                <div className="relative">
                  <Listbox.Button className="listbox-button w-60">
                    <span>{keySoundsConfig.resource.name}</span>
                    <span>
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-10">
                      {keySoundResources.map((keySoundResource) => (
                        <Listbox.Option key={keySoundResource.key} value={keySoundResource.key}>
                          {({ selected }) => (
                            <>
                              <div className="group flex cursor-pointer items-center justify-between">
                                <span>{keySoundResource.name}</span>
                                {selected ? (
                                  <span className="listbox-options-icon">
                                    <IconCheck className="focus:outline-none" />
                                  </span>
                                ) : null}
                                <IconEar
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onPlayKeySound(keySoundResource)
                                  }}
                                  className="mr-2  hidden cursor-pointer text-neutral-500 hover:text-indigo-400 group-hover:block dark:text-neutral-300"
                                />
                              </div>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>效果音</span>
            <div className={styles.switchBlock}>
              <Switch checked={hintSoundsConfig.isOpen} onChange={onToggleHintSounds} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                hintSoundsConfig.isOpen ? '开启' : '关闭'
              }`}</span>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>音量</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  defaultValue={[hintSoundsConfig.volume * 100]}
                  max={100}
                  min={1}
                  step={10}
                  className="slider"
                  onValueChange={onChangeHintSoundsVolume}
                  disabled={!hintSoundsConfig.isOpen}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{`${Math.floor(hintSoundsConfig.volume * 100)}%`}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
