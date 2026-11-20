import SettingScroll from './SettingScroll'
import styles from './index.module.css'
import { defaultFontSizeConfig } from '@/constants'
import { fontSizeConfigAtom, wordExtrasConfigAtom } from '@/store'
import { Switch } from '@headlessui/react'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export default function ViewSetting() {
  const [fontSizeConfig, setFontsizeConfig] = useAtom(fontSizeConfigAtom)
  const [extrasConfig, setExtrasConfig] = useAtom(wordExtrasConfigAtom)

  const extrasSwitches: { key: 'showImage' | 'showPos' | 'showChunks' | 'onlineLookup'; label: string; desc: string }[] = [
    { key: 'showImage', label: '单词图片 Image', desc: '每个单词配一张图' },
    { key: 'showPos', label: '词性 Part of speech', desc: '如 n. 名词 / v. 动词' },
    { key: 'showChunks', label: '语块 Chunks', desc: '常见搭配，如 cancel a meeting' },
    { key: 'onlineLookup', label: '在线补全 Online lookup', desc: '词库里没有时，联网查询并缓存（英文词库适用）' },
  ]

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
    <SettingScroll>
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
        <button className="my-btn-primary ml-4 disabled:bg-gray-300" type="button" onClick={onResetFontSize} title="重置字体设置">
          重置字体设置
        </button>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>单词扩展信息</span>
          <span className={styles.sectionDescription}>练习时在释义下方显示图片、词性和语块。默写模式下语块中的单词会被遮住</span>
          {extrasSwitches.map(({ key, label, desc }) => (
            <div className={styles.switchBlock} key={key} title={desc}>
              <Switch
                checked={extrasConfig[key]}
                onChange={(checked: boolean) => setExtrasConfig((prev) => ({ ...prev, [key]: checked }))}
                className="switch-root"
              >
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">{label}</span>
            </div>
          ))}
          <div className={styles.block}>
            <span className={styles.blockLabel}>Pixabay API Key（可选，图片更准）</span>
            <input
              type="text"
              value={extrasConfig.pixabayKey}
              placeholder="pixabay.com/api/docs 免费申请"
              onChange={(e) => setExtrasConfig((prev) => ({ ...prev, pixabayKey: e.target.value.trim() }))}
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </div>
    </SettingScroll>
  )
}
