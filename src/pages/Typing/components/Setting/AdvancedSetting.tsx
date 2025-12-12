import styles from './index.module.css'
import { isIgnoreCaseAtom, isShowAnswerOnHoverAtom, isShowPrevAndNextWordAtom, isTextSelectableAtom, randomConfigAtom } from '@/store'
import { Switch } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export default function AdvancedSetting() {
  const [randomConfig, setRandomConfig] = useAtom(randomConfigAtom)
  const [isShowPrevAndNextWord, setIsShowPrevAndNextWord] = useAtom(isShowPrevAndNextWordAtom)
  const [isIgnoreCase, setIsIgnoreCase] = useAtom(isIgnoreCaseAtom)
  const [isTextSelectable, setIsTextSelectable] = useAtom(isTextSelectableAtom)
  const [isShowAnswerOnHover, setIsShowAnswerOnHover] = useAtom(isShowAnswerOnHoverAtom)
  const { t } = useTranslation()

  const onToggleRandom = useCallback(
    (checked: boolean) => {
      setRandomConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setRandomConfig],
  )

  const onToggleLastAndNextWord = useCallback(
    (checked: boolean) => {
      setIsShowPrevAndNextWord(checked)
    },
    [setIsShowPrevAndNextWord],
  )

  const onToggleIgnoreCase = useCallback(
    (checked: boolean) => {
      setIsIgnoreCase(checked)
    },
    [setIsIgnoreCase],
  )

  const onToggleTextSelectable = useCallback(
    (checked: boolean) => {
      setIsTextSelectable(checked)
    },
    [setIsTextSelectable],
  )
  const onToggleShowAnswerOnHover = useCallback(
    (checked: boolean) => {
      setIsShowAnswerOnHover(checked)
    },
    [setIsShowAnswerOnHover],
  )

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.chapter_random')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.chapter_random_desc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={randomConfig.isOpen} onChange={onToggleRandom} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.advanced.random_enabled', {
                  status: randomConfig.isOpen ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.show_prev_next')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.show_prev_next_desc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isShowPrevAndNextWord} onChange={onToggleLastAndNextWord} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.advanced.show_words_enabled', {
                  status: isShowPrevAndNextWord ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.ignore_case')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.ignore_case_desc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isIgnoreCase} onChange={onToggleIgnoreCase} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.advanced.ignore_case_enabled', {
                  status: isIgnoreCase ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.text_selectable')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.text_selectable_desc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isTextSelectable} onChange={onToggleTextSelectable} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.advanced.text_selectable_enabled', {
                  status: isTextSelectable ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.show_hint_on_hover')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.show_hint_on_hover_desc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isShowAnswerOnHover} onChange={onToggleShowAnswerOnHover} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600">
                {t('settings.advanced.show_hint_enabled', {
                  status: isShowAnswerOnHover ? t('settings.status.enabled') : t('settings.status.disabled'),
                })}
              </span>
            </div>
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
