import styles from './index.module.css'
import { defaultFontSizeConfig } from '@/constants'
import { fontSizeConfigAtom, wordCompletionPauseConfigAtom } from '@/store'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import * as Switch from '@radix-ui/react-switch'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export default function ViewSetting() {
  const [fontSizeConfig, setFontsizeConfig] = useAtom(fontSizeConfigAtom)
  const [wordCompletionPauseConfig, setWordCompletionPauseConfig] = useAtom(wordCompletionPauseConfigAtom)

  const onChangeForeignFontSize = useCallback(
    (value: [number]) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        foreignFont: value[0],
      }))
    },
    [setFontsizeConfig],
  )

  const onChangeTranslateFontSize = useCallback(
    (value: [number]) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        translateFont: value[0],
      }))
    },
    [setFontsizeConfig],
  )

  const onResetFontSize = useCallback(() => {
    setFontsizeConfig({ ...defaultFontSizeConfig })
  }, [setFontsizeConfig])

  const onToggleWordCompletionPause = useCallback(
    (enabled: boolean) => {
      setWordCompletionPauseConfig((prev) => ({
        ...prev,
        isEnabled: enabled,
      }))
    },
    [setWordCompletionPauseConfig],
  )

  const onTogglePronunciation = useCallback(
    (enabled: boolean) => {
      setWordCompletionPauseConfig((prev) => ({
        ...prev,
        playPronunciation: enabled,
      }))
    },
    [setWordCompletionPauseConfig],
  )

  const onChangePauseDuration = useCallback(
    (value: [number]) => {
      setWordCompletionPauseConfig((prev) => ({
        ...prev,
        duration: value[0],
      }))
    },
    [setWordCompletionPauseConfig],
  )

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>字体设置</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>外语字体</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  value={[fontSizeConfig.foreignFont]}
                  min={20}
                  max={96}
                  step={4}
                  className="slider"
                  onValueChange={onChangeForeignFontSize}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{fontSizeConfig.foreignFont}px</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>中文字体</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  value={[fontSizeConfig.translateFont]}
                  max={60}
                  min={14}
                  step={4}
                  className="slider"
                  onValueChange={onChangeTranslateFontSize}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{fontSizeConfig.translateFont}px</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>单词完成设置</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>完成后暂停显示</span>
              <Switch.Root
                checked={wordCompletionPauseConfig.isEnabled}
                onCheckedChange={onToggleWordCompletionPause}
                className="relative h-6 w-11 cursor-default rounded-full bg-gray-200 outline-none data-[state=checked]:bg-indigo-500"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform will-change-transform duration-100 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            {wordCompletionPauseConfig.isEnabled && (
              <>
                <div className={styles.block}>
                  <span className={styles.blockLabel}>暂停时长</span>
                  <div className="flex h-5 w-full items-center justify-between">
                    <Slider.Root
                      value={[wordCompletionPauseConfig.duration]}
                      min={1000}
                      max={5000}
                      step={500}
                      className="slider"
                      onValueChange={onChangePauseDuration}
                    >
                      <Slider.Track>
                        <Slider.Range />
                      </Slider.Track>
                      <Slider.Thumb />
                    </Slider.Root>
                    <span className="ml-4 w-12 text-xs font-normal text-gray-600">{wordCompletionPauseConfig.duration / 1000}s</span>
                  </div>
                </div>

                <div className={styles.block}>
                  <span className={styles.blockLabel}>播放发音</span>
                  <Switch.Root
                    checked={wordCompletionPauseConfig.playPronunciation}
                    onCheckedChange={onTogglePronunciation}
                    className="relative h-6 w-11 cursor-default rounded-full bg-gray-200 outline-none data-[state=checked]:bg-indigo-500"
                  >
                    <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform will-change-transform duration-100 data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </div>
              </>
            )}
          </div>

          <button className="my-btn-primary ml-4 disabled:bg-gray-300" type="button" onClick={onResetFontSize} title="重置字体设置">
            重置字体设置
          </button>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
