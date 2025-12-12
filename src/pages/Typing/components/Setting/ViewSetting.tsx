import styles from './index.module.css'
import { defaultFontSizeConfig } from '@/constants'
import { fontSizeConfigAtom } from '@/store'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export default function ViewSetting() {
  const [fontSizeConfig, setFontsizeConfig] = useAtom(fontSizeConfigAtom)
  const { t } = useTranslation()

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

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.view.font_settings')}</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.view.foreign_font')}</span>
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
              <span className={styles.blockLabel}>{t('settings.view.chinese_font')}</span>
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
          <button
            className="my-btn-primary ml-4 disabled:bg-gray-300"
            type="button"
            onClick={onResetFontSize}
            title={t('settings.view.reset_font_settings')}
          >
            {t('settings.view.reset_font_settings')}
          </button>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
