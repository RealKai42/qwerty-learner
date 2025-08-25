import { Listbox, Transition } from '@headlessui/react'
import { useCallback, useMemo } from 'react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import IconCheck from '~icons/tabler/check'
import IconChevronDown from '~icons/tabler/chevron-down'

type LangOption = {
  id: 'en' | 'zh'
  name: string
}

const options: LangOption[] = [
  { id: 'en', name: 'English' },
  { id: 'zh', name: '中文' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const current = useMemo(() => options.find((o) => o.id === (i18n.language.startsWith('zh') ? 'zh' : 'en')) ?? options[0], [i18n.language])

  const onChange = useCallback(
    async (value: 'en' | 'zh') => {
      await i18n.changeLanguage(value)
      localStorage.setItem('i18n_lang', value)
    },
    [i18n],
  )

  return (
    <Listbox value={current.id} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="listbox-button w-28">
          <span>{current.name}</span>
          <span>
            <IconChevronDown className="focus:outline-none" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="listbox-options">
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
  )
}



