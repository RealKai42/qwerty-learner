import { GalleryContext } from '.'
import deFlag from '@/assets/flags/de.png'
import enFlag from '@/assets/flags/en.png'
import jpFlag from '@/assets/flags/ja.png'
import { LanguageCategoryType } from '@/typings'
import { RadioGroup } from '@headlessui/react'
import { useContext } from 'react'

export type LanguageTabOption = {
  id: LanguageCategoryType
  name: string
  flag: string
}

const options: LanguageTabOption[] = [
  { id: 'en', name: '英语', flag: enFlag },
  { id: 'ja', name: '日语', flag: jpFlag },
  { id: 'de', name: '德语', flag: deFlag },
]

export function LanguageTabSwitcher() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { state, setState } = useContext(GalleryContext)!

  const onChangeTab = (tab: string) => {
    setState((draft) => {
      draft.currentLanguageTab = tab as LanguageCategoryType
    })
  }

  return (
    <RadioGroup value={state.currentLanguageTab} onChange={onChangeTab}>
      <div className="flex items-center space-x-2">
        {options.map((option) => (
          <RadioGroup.Option key={option.id} value={option.id} className="cursor-pointer">
            {({ checked }) => (
              <div className={`border-b-2 px-2 pb-1 flex items-center ${checked ? 'border-indigo-500' : 'border-transparent'}`}>
                <img src={option.flag} className="h-7 w-7 mr-1.5" />
                <p className={`text-gray-700 font-medium text-lg`}>{option.name}</p>
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
