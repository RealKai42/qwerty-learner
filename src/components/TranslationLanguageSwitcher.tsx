import type { TranslationLanguageType } from '@/typings'
import { Listbox, Transition } from '@headlessui/react'
import { Fragment, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'

type TranslationLangOption = {
  id: TranslationLanguageType
  name: string
}

const options: TranslationLangOption[] = [
  { id: 'zh', name: '中文' },
  { id: 'ar', name: 'العربية' },
  { id: 'en', name: 'English' },
]

export interface TranslationLanguageSwitcherProps {
  value: TranslationLanguageType
  onChange: (value: TranslationLanguageType) => void
}

export default function TranslationLanguageSwitcher({ value, onChange }: TranslationLanguageSwitcherProps) {
  const { t } = useTranslation()

  const current = useMemo(() => options.find((o) => o.id === value) ?? options[0], [value])

  const handleChange = useCallback(
    (newValue: TranslationLanguageType) => {
      onChange(newValue)
    },
    [onChange],
  )

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{t('translation.language')}:</span>
      <Listbox value={current.id} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button className="listbox-button w-24">
            <span>{current.name}</span>
            <span>
              <IconChevronDown className="focus:outline-none" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="listbox-options z-30">
              {options.map((item) => (
                <Listbox.Option key={item.id} value={item.id}>
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
        </div>
      </Listbox>
    </div>
  )
}
