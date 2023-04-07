import { LANG_PRON_MAP } from '@/resources/soundResource'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { currentDictInfoAtom, pronunciationConfigAtom } from '@/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Listbox } from '@headlessui/react'
import classNames from 'classnames'

const PronunciationSwitcher = () => {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const pronunciationList = useMemo(() => LANG_PRON_MAP[currentDictInfo.language].pronunciation, [currentDictInfo.language])

  const itemList = [...pronunciationList, { pron: 'false', name: '关闭' }]
  const [selectedItem, setSelectedItem] = useState(itemList[0])

  useEffect(() => {
    const pronIndex = currentDictInfo.defaultPronIndex || LANG_PRON_MAP[currentDictInfo.language].defaultPronIndex
    const defaultPron = pronunciationList[pronIndex]

    // only change the type and name, keep the isOpen state
    const index = pronunciationList.findIndex((item) => item.pron === pronunciationConfig.type)
    if (index !== -1) {
      setSelectedItem(pronunciationList[index])
      return
    } else {
      setPronunciationConfig((old) => ({
        ...old,
        type: defaultPron.pron,
        name: defaultPron.name,
      }))
      setSelectedItem(defaultPron)
    }
  }, [currentDictInfo.defaultPronIndex, currentDictInfo.language, setPronunciationConfig, pronunciationList, pronunciationConfig.type])

  const setSelectedPron = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any) => {
      setSelectedItem(value)
      if (value.pron === 'false') {
        setPronunciationConfig((old) => ({
          ...old,
          isOpen: false,
        }))
      } else {
        setPronunciationConfig((old) => ({
          ...old,
          isOpen: true,
          type: value.pron,
          name: value.name,
        }))
      }
    },
    [setPronunciationConfig],
  )

  return (
    <Listbox value={selectedItem} onChange={setSelectedPron}>
      <div className="relative">
        <Listbox.Button className="flex h-8 w-12 cursor-pointer items-center justify-center rounded-md bg-transparent transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100">
          {selectedItem.name}
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 sm:text-sm">
          {itemList.map((item) => (
            <Listbox.Option
              key={item.pron}
              value={item}
              className={({ active }) =>
                classNames(
                  active ? 'bg-indigo-400 text-white' : 'text-gray-900',
                  'relative flex w-full cursor-default select-none items-center justify-center py-1 dark:text-white ',
                )
              }
            >
              {item.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}

export default PronunciationSwitcher
