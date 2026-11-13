import styles from './index.module.css'
import {
  isIgnoreCaseAtom,
  isShowAnswerOnHoverAtom,
  isShowPrevAndNextWordAtom,
  isSkipParenthesesAtom,
  isTextSelectableAtom,
  randomConfigAtom,
  typingShortcutConfigAtom,
} from '@/store'
import { eventToShortcut, formatShortcut } from '@/utils/hotkeys'
import { Switch } from '@headlessui/react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const SHORTCUT_ITEMS = [
  { key: 'prevWord', labelKey: 'settings.advanced.prevWordShortcut' },
  { key: 'nextWord', labelKey: 'settings.advanced.nextWordShortcut' },
  { key: 'favoriteCurrent', labelKey: 'settings.advanced.favoriteCurrentShortcut' },
  { key: 'favoritePrev', labelKey: 'settings.advanced.favoritePrevShortcut' },
  { key: 'favoriteNext', labelKey: 'settings.advanced.favoriteNextShortcut' },
  { key: 'pronunciation', labelKey: 'settings.advanced.pronunciationShortcut' },
] as const

type ShortcutKey = (typeof SHORTCUT_ITEMS)[number]['key']

export default function AdvancedSetting() {
  const { t } = useTranslation()
  const [randomConfig, setRandomConfig] = useAtom(randomConfigAtom)
  const [isShowPrevAndNextWord, setIsShowPrevAndNextWord] = useAtom(isShowPrevAndNextWordAtom)
  const [isIgnoreCase, setIsIgnoreCase] = useAtom(isIgnoreCaseAtom)
  const [isTextSelectable, setIsTextSelectable] = useAtom(isTextSelectableAtom)
  const [isShowAnswerOnHover, setIsShowAnswerOnHover] = useAtom(isShowAnswerOnHoverAtom)
  const [isSkipParentheses, setIsSkipParentheses] = useAtom(isSkipParenthesesAtom)
  const [typingShortcutConfig, setTypingShortcutConfig] = useAtom(typingShortcutConfigAtom)
  const [recordingKey, setRecordingKey] = useState<ShortcutKey | null>(null)

  useEffect(() => {
    if (!recordingKey) return
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const shortcut = eventToShortcut(e)
      if (!shortcut) return
      setTypingShortcutConfig((prev) => ({ ...prev, [recordingKey]: shortcut }))
      setRecordingKey(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [recordingKey, setTypingShortcutConfig])

  const onToggleRecord = useCallback((key: ShortcutKey) => {
    setRecordingKey((cur) => (cur === key ? null : key))
  }, [])

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

  const onToggleSkipParentheses = useCallback(
    (checked: boolean) => {
      setIsSkipParentheses(checked)
    },
    [setIsSkipParentheses],
  )

  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.randomChapter')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.randomChapterDesc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={randomConfig.isOpen} onChange={onToggleRandom} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600 dark:text-gray-400">
                {randomConfig.isOpen ? t('settings.advanced.randomOn') : t('settings.advanced.randomOff')}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.showPrevNextWord')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.showPrevNextWordDesc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isShowPrevAndNextWord} onChange={onToggleLastAndNextWord} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600 dark:text-gray-400">
                {isShowPrevAndNextWord ? t('settings.advanced.showWordOn') : t('settings.advanced.showWordOff')}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.shortcut')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.shortcutDesc')}</span>
            <div className={styles.block}>
              {SHORTCUT_ITEMS.map((item) => (
                <div key={item.key} className="flex w-full items-center justify-between">
                  <span className={styles.blockLabel}>{t(item.labelKey)}</span>
                  <button
                    type="button"
                    onClick={() => onToggleRecord(item.key)}
                    className={`rounded border px-3 py-1 text-sm transition-colors ${
                      recordingKey === item.key
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-500'
                        : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-500 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {recordingKey === item.key ? t('settings.advanced.recording') : formatShortcut(typingShortcutConfig[item.key])}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.ignoreCase')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.ignoreCaseDesc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isIgnoreCase} onChange={onToggleIgnoreCase} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600 dark:text-gray-400">
                {isIgnoreCase ? t('settings.advanced.ignoreCaseOn') : t('settings.advanced.ignoreCaseOff')}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.skipParentheses')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.skipParenthesesDesc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isSkipParentheses} onChange={onToggleSkipParentheses} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600 dark:text-gray-400">
                {isSkipParentheses ? t('settings.advanced.skipParenthesesOn') : t('settings.advanced.skipParenthesesOff')}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.textSelectable')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.textSelectableDesc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isTextSelectable} onChange={onToggleTextSelectable} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600 dark:text-gray-400">
                {isTextSelectable ? t('settings.advanced.textSelectableOn') : t('settings.advanced.textSelectableOff')}
              </span>
            </div>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>{t('settings.advanced.showHintInDictation')}</span>
            <span className={styles.sectionDescription}>{t('settings.advanced.showHintInDictationDesc')}</span>
            <div className={styles.switchBlock}>
              <Switch checked={isShowAnswerOnHover} onChange={onToggleShowAnswerOnHover} className="switch-root">
                <span aria-hidden="true" className="switch-thumb" />
              </Switch>
              <span className="text-right text-xs font-normal leading-tight text-gray-600 dark:text-gray-400">
                {isShowAnswerOnHover ? t('settings.advanced.showHintOn') : t('settings.advanced.showHintOff')}
              </span>
            </div>
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
