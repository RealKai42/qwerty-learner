import styles from './index.module.css'
import { fontSizeConfigAtom } from '@/store'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export default function ViewSetting() {
  const [fontSizeConfig, setFontsizeConfig] = useAtom(fontSizeConfigAtom)

  const onChangeEnglishFontSize = useCallback(
    (value: [number]) => {
      setFontsizeConfig((prev) => ({
        ...prev,
        englishFont: value[0],
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
                  defaultValue={[fontSizeConfig.englishFont]}
                  min={40}
                  max={96}
                  step={4}
                  className="slider"
                  onValueChange={onChangeEnglishFontSize}
                >
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider.Root>
                <span className="ml-4 w-10 text-xs font-normal text-gray-600">{fontSizeConfig.englishFont}px</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>中文字体</span>
              <div className="flex h-5 w-full items-center justify-between">
                <Slider.Root
                  defaultValue={[fontSizeConfig.translateFont]}
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
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
