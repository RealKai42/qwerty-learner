import { i18nConfigAtom } from '@/store'
import type { I18nType } from '@/typings'
import { Listbox, Transition } from '@headlessui/react'
import { useAtom } from 'jotai'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconParkOutlineChinese from '~icons/icon-park-outline/chinese'
import IconParkOutlineEnglish from '~icons/icon-park-outline/english'
import IconCheck from '~icons/tabler/check'

const I18nList: { name: string; type: I18nType }[] = [
  {
    name: '中文 (简体)',
    type: 'zh',
  },
  {
    name: 'English (US)',
    type: 'en',
  },
]

export default function I18nButton() {
  const [i18nConfig, setI18nConfig] = useAtom(i18nConfigAtom)
  const [currentType, setCurrentType] = useState(I18nList[0])
  const { i18n } = useTranslation()

  useEffect(() => {
    setCurrentType(I18nList.find((item) => item.type === i18nConfig.type) || I18nList[0])
    i18n.changeLanguage(i18nConfig.type)
  }, [i18n, i18nConfig.type])

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === ' ') {
      event.preventDefault()
    }
  }

  const onChangeI18nType = (value: I18nType) => {
    setI18nConfig((old) => ({ ...old, type: value }))
  }

  return (
    <Listbox value={currentType.type} onChange={onChangeI18nType}>
      <Listbox.Button
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white`}
      >
        {currentType.type === 'en' ? <IconParkOutlineEnglish className="icon" /> : <IconParkOutlineChinese className="icon" />}
      </Listbox.Button>
      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
        <Listbox.Options className="listbox-options z-10 w-40">
          {I18nList.map((item) => (
            <Listbox.Option key={item.name} value={item.type}>
              {({ selected }) => (
                <>
                  <span>{item.name}</span>
                  {selected ? (
                    <span className="listbox-options-icon">
                      <IconCheck className="focus:outline-none" />
                    </span>
                  ) : null}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  )
}
