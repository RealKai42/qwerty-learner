import styles from './index.module.css'
import { hintSoundsConfigAtom, keySoundsConfigAtom, pronunciationConfigAtom } from '@/store'
import { Switch } from '@headlessui/react'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export default function SoundSetting() {
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const [keySoundsConfig, setKeySoundsConfig] = useAtom(keySoundsConfigAtom)
  const [hintSoundsConfig, setHintSoundsConfig] = useAtom(hintSoundsConfigAtom)

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
  )
}
