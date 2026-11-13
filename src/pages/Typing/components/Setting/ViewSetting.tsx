import styles from './index.module.css'
import { defaultFontSizeConfig } from '@/constants'
import { foreignFontResources, translateFontResources } from '@/resources/fontResource'
import {
  darkModeFollowSystemAtom,
  fontSizeConfigAtom,
  foreignFontConfigAtom,
  isOpenDarkModeAtom,
  languageAtom,
  translateFontConfigAtom,
} from '@/store'
import { Listbox, Switch, Transition } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Slider from '@radix-ui/react-slider'
import i18n from 'i18next'
import { useAtom } from 'jotai'
import { Fragment, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'

const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]

export default function ViewSetting() {
  const { t } = useTranslation()
  const [fontSizeConfig, setFontsizeConfig] = useAtom(fontSizeConfigAtom)
  const [foreignFontConfig, setForeignFontConfig] = useAtom(foreignFontConfigAtom)
  const [translateFontConfig, setTranslateFontConfig] = useAtom(translateFontConfigAtom)
  const [darkMode, setDarkMode] = useAtom(isOpenDarkModeAtom)
  const [followSystem, setFollowSystem] = useAtom(darkModeFollowSystemAtom)
  const [language, setLanguage] = useAtom(languageAtom)

  const availableForeignFonts = useMemo(
    () => foreignFontResources.filter((f) => !f.localOnly || document.fonts.check(`16px ${f.family}`)),
    [],
  )
  const availableTranslateFonts = useMemo(
    () => translateFontResources.filter((f) => !f.localOnly || document.fonts.check(`16px ${f.family}`)),
    [],
  )

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
    setForeignFontConfig({ resource: foreignFontResources[0] })
    setTranslateFontConfig({ resource: translateFontResources[0] })
  }, [setFontsizeConfig, setForeignFontConfig, setTranslateFontConfig])

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.view.appearance')}</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.view.language')}</span>
              <Listbox
                value={language}
                onChange={(code) => {
                  setLanguage(code)
                  i18n.changeLanguage(code)
                }}
              >
                <div className="relative">
                  <Listbox.Button className="listbox-button w-60">
                    <span>{LANGUAGES.find((l) => l.code === language)?.label}</span>
                    <span>
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-10">
                      {LANGUAGES.map((lang) => (
                        <Listbox.Option key={lang.code} value={lang.code}>
                          {({ selected }) => (
                            <div className="group flex cursor-pointer items-center justify-between">
                              <span>{lang.label}</span>
                              {selected ? (
                                <span className="listbox-options-icon">
                                  <IconCheck className="focus:outline-none" />
                                </span>
                              ) : null}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
            <div className={styles.switchBlock}>
              <span className={styles.blockLabel}>{t('settings.view.followSystem')}</span>
              <Switch checked={followSystem} onChange={setFollowSystem} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
            </div>
            {!followSystem && (
              <div className={styles.switchBlock}>
                <span className={styles.blockLabel}>{t('settings.view.darkMode')}</span>
                <Switch checked={darkMode} onChange={setDarkMode} className="switch-root">
                  <span aria-hidden="true" className="switch-thumb" />
                </Switch>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.view.fontSettings')}</span>
            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.view.foreignFont')}</span>
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
                <span className="ml-4 w-10 text-xs font-normal text-gray-600 dark:text-gray-400">{fontSizeConfig.foreignFont}px</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.view.foreignFontStyle')}</span>
              <Listbox
                value={foreignFontConfig.resource.key}
                onChange={(key) => {
                  const resource = availableForeignFonts.find((f) => f.key === key)
                  if (resource) setForeignFontConfig((prev) => ({ ...prev, resource }))
                }}
              >
                <div className="relative">
                  <Listbox.Button className="listbox-button w-60">
                    <span>{foreignFontConfig.resource.name}</span>
                    <span>
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-10">
                      {availableForeignFonts.map((fontResource) => (
                        <Listbox.Option key={fontResource.key} value={fontResource.key}>
                          {({ selected }) => (
                            <div className="group flex cursor-pointer items-center justify-between">
                              <span style={fontResource.family ? { fontFamily: fontResource.family } : undefined}>{fontResource.name}</span>
                              {selected ? (
                                <span className="listbox-options-icon">
                                  <IconCheck className="focus:outline-none" />
                                </span>
                              ) : null}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.view.chineseFont')}</span>
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
                <span className="ml-4 w-10 text-xs font-normal text-gray-600 dark:text-gray-400">{fontSizeConfig.translateFont}px</span>
              </div>
            </div>

            <div className={styles.block}>
              <span className={styles.blockLabel}>{t('settings.view.chineseFontStyle')}</span>
              <Listbox
                value={translateFontConfig.resource.key}
                onChange={(key) => {
                  const resource = availableTranslateFonts.find((f) => f.key === key)
                  if (resource) setTranslateFontConfig((prev) => ({ ...prev, resource }))
                }}
              >
                <div className="relative">
                  <Listbox.Button className="listbox-button w-60">
                    <span>{translateFontConfig.resource.name}</span>
                    <span>
                      <IconChevronDown className="focus:outline-none" />
                    </span>
                  </Listbox.Button>
                  <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="listbox-options z-10">
                      {availableTranslateFonts.map((fontResource) => (
                        <Listbox.Option key={fontResource.key} value={fontResource.key}>
                          {({ selected }) => (
                            <div className="group flex cursor-pointer items-center justify-between">
                              <span style={fontResource.family ? { fontFamily: fontResource.family } : undefined}>{fontResource.name}</span>
                              {selected ? (
                                <span className="listbox-options-icon">
                                  <IconCheck className="focus:outline-none" />
                                </span>
                              ) : null}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
          <button
            className="my-btn-primary ml-4 disabled:bg-gray-300 dark:disabled:bg-gray-600"
            type="button"
            onClick={onResetFontSize}
            title={t('settings.view.resetFontSettings')}
          >
            {t('settings.view.resetFontSettings')}
          </button>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
