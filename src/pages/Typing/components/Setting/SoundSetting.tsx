import styles from './index.module.css'
import { keySoundResources } from '@/resources/soundResource'
import { hintSoundsConfigAtom, keySoundsConfigAtom, pronunciationConfigAtom } from '@/store'
import type { SoundResource } from '@/typings'
import { toFixedNumber } from '@/utils'
import { playKeySoundResource } from '@/utils/sounds/keySounds'
import { Listbox, Switch, Transition } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { Fragment, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconEar from '~icons/tabler/ear'

export default function SoundSetting() {
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const [keySoundsConfig, setKeySoundsConfig] = useAtom(keySoundsConfigAtom)
  const [hintSoundsConfig, setHintSoundsConfig] = useAtom(hintSoundsConfigAtom)
  const { t } = useTranslation()

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

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.sound.word_pronunciation')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={pronunciationConfig.isOpen} onChange={onTogglePronunciation} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.sound.pronunciation_enabled', {
                  status: pronunciationConfig.isOpen ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.sound.volume')}</span>
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
              <span className={styles.blockLabel}>{t('settings.sound.speed')}</span>
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
              <span className={styles.sectionLabel}>{t('settings.sound.translation_pronunciation')}</span>
              <div className={styles.switchBlock}>
                <Switch checked={pronunciationConfig.isTransRead} onChange={onTogglePronunciationIsTransRead} className="switch-root">
                  <span aria-hidden="true" className="switch-thumb" />
                </Switch>
                <span className="text-right text-xs font-normal leading-tight text-gray-600">
                  {t('settings.sound.pronunciation_enabled', {
                    status: pronunciationConfig.isTransRead ? t('settings.status.enabled') : t('settings.status.disabled'),
                  })}
                </span>
              </div>
              <div className={styles.block}>
                <span className={styles.blockLabel}>{t('settings.sound.volume')}</span>
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
            </div>
          )}

          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.sound.key_sounds')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={keySoundsConfig.isOpen} onChange={onToggleKeySounds} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.sound.key_sounds_enabled', {
                  status: keySoundsConfig.isOpen ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.sound.volume')}</span>
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
              <span className={styles.blockLabel}>{t('settings.sound.key_sound_effects')}</span>
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
            <span className={styles.sectionLabel}>{t('settings.sound.effect_sounds')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={hintSoundsConfig.isOpen} onChange={onToggleHintSounds} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.sound.effect_sounds_enabled', {
                  status: hintSoundsConfig.isOpen ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.sound.volume')}</span>
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
