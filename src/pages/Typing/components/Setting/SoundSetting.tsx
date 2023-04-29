import styles from './index.module.css'
import { keySoundResources } from '@/resources/soundResource'
import { SOUND_URL_PREFIX } from '@/resources/soundResource'
import { hintSoundsConfigAtom, keySoundsConfigAtom, pronunciationConfigAtom } from '@/store'
import { SoundResource } from '@/typings'
import { toFixedNumber } from '@/utils'
import { Switch, Transition } from '@headlessui/react'
import { Listbox } from '@headlessui/react'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { Fragment } from 'react'
import useSound from 'use-sound'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'
import IconEar from '~icons/tabler/ear'

export default function SoundSetting() {
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const [keySoundsConfig, setKeySoundsConfig] = useAtom(keySoundsConfigAtom)
  const [hintSoundsConfig, setHintSoundsConfig] = useAtom(hintSoundsConfigAtom)
  console.log('????', keySoundsConfig)
  const [filename, setFilename] = useState(keySoundsConfig.resource.filename)
  const [playClickSound] = useSound(`${SOUND_URL_PREFIX}${filename}`)

  useEffect(() => {
    playClickSound()
  }, [filename])

  const onTogglePronunciation = useCallback(
    (checked: boolean) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        isOpen: checked,
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

  // 设置音效
  const onChangeKeySoundsEffect = useCallback(
    (key: string) => {
      setKeySoundsConfig((prev) => ({
        ...prev,
        resource: keySoundResources.find((item: SoundResource) => Number(item.key) === Number(key)) as SoundResource,
      }))
    },
    [setKeySoundsConfig],
  )

  function soundPlay(key: string): void {
    const sound = keySoundResources.find((item: SoundResource) => Number(item.key) === Number(key)) as SoundResource
    setFilename(sound.filename)
  }

  return (
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

      {/*  音效设置 */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>音效设置</span>
        <div className={`${styles.block} flex`}>
          <span className={styles.blockLabel}>按键音效</span>
          <Listbox value={keySoundsConfig.resource.key} onChange={onChangeKeySoundsEffect}>
            <div className="relative">
              <Listbox.Button className="listbox-button">
                <span>{keySoundsConfig.resource.name}</span>
                <span>
                  <IconChevronDown className="focus:outline-none" />
                </span>
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="listbox-options">
                  {keySoundResources.map((keySound) => (
                    <Listbox.Option key={keySound.key} value={keySound.key} className={styles.soundOption}>
                      {({ selected }) => (
                        <>
                          <div className="flex items-center justify-between">
                            <span>{keySound.name}</span>
                            {selected ? (
                              <span className="listbox-options-icon">
                                <IconCheck className="focus:outline-none" />
                              </span>
                            ) : null}
                            <IconEar
                              onClick={(e) => {
                                e.stopPropagation()
                                soundPlay(keySound.key)
                              }}
                              className=" text-neutral-500  dark:text-neutral-300"
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
    </div>
  )
}
