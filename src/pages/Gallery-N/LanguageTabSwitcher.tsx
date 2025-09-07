import { GalleryContext } from '.'
import arFlag from '@/assets/flags/ar.png'
import codeFlag from '@/assets/flags/code.png'
import deFlag from '@/assets/flags/de.png'
import enFlag from '@/assets/flags/en.png'
import idFlag from '@/assets/flags/id.png'
import jpFlag from '@/assets/flags/ja.png'
import kkFlag from '@/assets/flags/kk.png'
import type { LanguageCategoryType } from '@/typings'
import { RadioGroup } from '@headlessui/react'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

export type LanguageTabOption = {
  id: LanguageCategoryType
  name: string
  flag: string
}

const createOptions = (t: (k: string) => string): LanguageTabOption[] => [
  { id: 'en', name: t('gallery.tab.en'), flag: enFlag },
  { id: 'ja', name: t('gallery.tab.ja'), flag: jpFlag },
  { id: 'de', name: t('gallery.tab.de'), flag: deFlag },
  { id: 'kk', name: t('gallery.tab.kk'), flag: kkFlag },
  { id: 'id', name: t('gallery.tab.id'), flag: idFlag },
  { id: 'ar', name: t('gallery.tab.ar'), flag: arFlag },
  { id: 'code', name: t('gallery.tab.code'), flag: codeFlag },
]

export function LanguageTabSwitcher() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { state, setState } = useContext(GalleryContext)!
  const { t } = useTranslation()

  const onChangeTab = useCallback(
    (tab: string) => {
      setState((draft) => {
        draft.currentLanguageTab = tab as LanguageCategoryType
      })
    },
    [setState],
  )

  return (
    <RadioGroup value={state.currentLanguageTab} onChange={onChangeTab}>
      <div className="flex items-center space-x-4">
        {createOptions(t).map((option) => (
          <RadioGroup.Option key={option.id} value={option.id} className="cursor-pointer">
            {({ checked }) => (
              <div className={`flex items-center border-b-2 px-2 pb-1 ${checked ? 'border-indigo-500' : 'border-transparent'}`}>
                <img src={option.flag} className="mr-1.5 h-7 w-7" />
                <p className={`text-lg font-medium text-gray-700 dark:text-gray-200`}>{option.name}</p>
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
