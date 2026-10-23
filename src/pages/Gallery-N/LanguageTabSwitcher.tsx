import { GalleryContext } from '.'
import type { GalleryTabType } from '.'
import codeFlag from '@/assets/flags/code.png'
import deFlag from '@/assets/flags/de.png'
import enFlag from '@/assets/flags/en.png'
import idFlag from '@/assets/flags/id.png'
import jpFlag from '@/assets/flags/ja.png'
import kkFlag from '@/assets/flags/kk.png'
import { RadioGroup } from '@headlessui/react'
import { BookOpen } from 'lucide-react'
import { useCallback, useContext } from 'react'

export type LanguageTabOption = {
  id: GalleryTabType
  name: string
  flag?: string
}

const options: LanguageTabOption[] = [
  { id: 'en', name: '英语', flag: enFlag },
  { id: 'ja', name: '日语', flag: jpFlag },
  { id: 'maimemo', name: '墨墨每日词汇' },
  { id: 'custom', name: '自定义词书' },
  { id: 'de', name: '德语', flag: deFlag },
  { id: 'kk', name: '哈萨克语', flag: kkFlag },
  { id: 'id', name: '印尼语', flag: idFlag },
  { id: 'code', name: 'Code', flag: codeFlag },
]

export function LanguageTabSwitcher() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { state, setState } = useContext(GalleryContext)!

  const onChangeTab = useCallback(
    (tab: string) => {
      setState((draft) => {
        draft.currentLanguageTab = tab as GalleryTabType
      })
    },
    [setState],
  )

  return (
    <RadioGroup value={state.currentLanguageTab} onChange={onChangeTab}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {options.map((option) => (
          <RadioGroup.Option key={option.id} value={option.id} className="cursor-pointer">
            {({ checked }) => (
              <div className={`flex items-center border-b-2 px-2 pb-1 ${checked ? 'border-indigo-500' : 'border-transparent'}`}>
                {option.flag ? (
                  <img src={option.flag} className="mr-1.5 h-7 w-7" alt="" />
                ) : (
                  <BookOpen className="mr-1.5 h-7 w-7 text-indigo-500" />
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
