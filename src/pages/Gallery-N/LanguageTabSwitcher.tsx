import { GalleryContext } from '.'
import codeFlag from '@/assets/flags/code.png'
import deFlag from '@/assets/flags/de.png'
import enFlag from '@/assets/flags/en.png'
import idFlag from '@/assets/flags/id.png'
import jpFlag from '@/assets/flags/ja.png'
import kkFlag from '@/assets/flags/kk.png'
import type { LanguageCategoryType } from '@/typings'
import { RadioGroup } from '@headlessui/react'
import { useCallback, useContext } from 'react'
import IconHeart from '~icons/lucide/heart'

export type LanguageTabOption = {
  id: LanguageCategoryType | 'favorites'
  name: string
  flag: string | JSX.Element
}

const options: LanguageTabOption[] = [
  { id: 'en', name: '英语', flag: enFlag },
  { id: 'ja', name: '日语', flag: jpFlag },
  { id: 'de', name: '德语', flag: deFlag },
  { id: 'kk', name: '哈萨克语', flag: kkFlag },
  { id: 'id', name: '印尼语', flag: idFlag },
  { id: 'code', name: 'Code', flag: codeFlag },
  { id: 'favorites', name: '收藏夹', flag: <IconHeart className="h-7 w-7" /> },
]

export function LanguageTabSwitcher() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { state, setState } = useContext(GalleryContext)!

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
              <div className={`flex items-center border-b-2 px-2 pb-1 ${checked ? 'border-indigo-500' : 'border-transparent'}`}>
                {typeof option.flag === 'string' ? (
                  <img src={option.flag} className="mr-1.5 h-7 w-7" />
                ) : (
                  <div className="mr-1.5 h-7 w-7">{option.flag}</div>
                )}
                <p className={`text-lg font-medium text-gray-700 dark:text-gray-200`}>{option.name}</p>
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
