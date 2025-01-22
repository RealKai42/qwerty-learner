import { GalleryContext } from '.'
import codeFlag from '@/assets/flags/code.png'
import deFlag from '@/assets/flags/de.png'
import enFlag from '@/assets/flags/en.png'
import idFlag from '@/assets/flags/id.png'
import jpFlag from '@/assets/flags/ja.png'
import kkFlag from '@/assets/flags/kk.png'
import { isMobileAtom } from '@/store'
import type { LanguageCategoryType } from '@/typings'
import { RadioGroup } from '@headlessui/react'
import { clsx } from 'clsx'
import { useAtomValue } from 'jotai'
import { useCallback, useContext } from 'react'

export type LanguageTabOption = {
  id: LanguageCategoryType
  name: string
  flag: string
}

const options: LanguageTabOption[] = [
  { id: 'en', name: '英语', flag: '🇬🇧' },
  { id: 'ja', name: '日语', flag: '🇯🇵' },
  { id: 'de', name: '德语', flag: '🇩🇪' },
  { id: 'kk', name: '哈萨克语', flag: '🇰🇿' },
  { id: 'id', name: '印尼语', flag: '🇮🇩' },
  { id: 'code', name: 'Code', flag: '🧑‍💻' },
]

export function LanguageTabSwitcher() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { state, setState } = useContext(GalleryContext)!
  const isMobile = useAtomValue(isMobileAtom)

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
        {options.map((option) => (
          <RadioGroup.Option key={option.id} value={option.id} className="cursor-pointer">
            {({ checked }) => (
              <div className={`flex items-center border-b-2 p-1 ${checked ? 'border-indigo-500' : 'border-transparent'}`}>
                <span className="text-xl">{option.flag}</span>
                <p
                  className={clsx(`ml-2 text-nowrap text-lg font-medium text-gray-700 dark:text-gray-200`, {
                    hidden: isMobile,
                  })}
                >
                  {option.name}
                </p>
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
