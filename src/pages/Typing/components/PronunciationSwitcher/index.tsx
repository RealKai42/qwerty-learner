import { LANG_PRON_MAP } from '@/resources/soundResource'
import { useAtom, useAtomValue } from 'jotai'
import { currentDictInfoAtom, pronunciationConfigAtom } from '@/store'
import { useCallback, useEffect, useMemo } from 'react'
import { Listbox } from '@headlessui/react'
import { PronunciationType } from '@/typings'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Fragment } from 'react'
import { Popover, Transition, Switch } from '@headlessui/react'

const PronunciationSwitcher = () => {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const pronunciationList = useMemo(() => LANG_PRON_MAP[currentDictInfo.language].pronunciation, [currentDictInfo.language])

  useEffect(() => {
    const defaultPronIndex = currentDictInfo.defaultPronIndex || LANG_PRON_MAP[currentDictInfo.language].defaultPronIndex
    const defaultPron = pronunciationList[defaultPronIndex]

    // if the current pronunciation is not in the pronunciation list, reset the pronunciation config to default
    const index = pronunciationList.findIndex((item) => item.pron === pronunciationConfig.type)
    if (index === -1) {
      // only change the type and name, keep the isOpen state
      setPronunciationConfig((old) => ({
        ...old,
        type: defaultPron.pron,
        name: defaultPron.name,
      }))
    }
  }, [currentDictInfo.defaultPronIndex, currentDictInfo.language, setPronunciationConfig, pronunciationList, pronunciationConfig.type])

  const onChangePronunciationIsOpen = useCallback(
    (value: boolean) => {
      setPronunciationConfig((old) => ({
        ...old,
        isOpen: value,
      }))
    },
    [setPronunciationConfig],
  )

  const onChangePronunciationIsLoop = useCallback(
    (value: boolean) => {
      setPronunciationConfig((old) => ({
        ...old,
        isLoop: value,
      }))
    },
    [setPronunciationConfig],
  )

  const onChangePronunciationType = useCallback(
    (value: PronunciationType) => {
      const item = pronunciationList.find((item) => item.pron === value)
      if (item) {
        setPronunciationConfig((old) => ({
          ...old,
          type: item.pron,
          name: item.name,
        }))
      }
    },
    [setPronunciationConfig, pronunciationList],
  )

  const currentLabel = useMemo(() => {
    if (pronunciationConfig.isOpen) {
      return pronunciationConfig.name
    } else {
      return '关闭'
    }
  }, [pronunciationConfig.isOpen, pronunciationConfig.name])

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex h-8  cursor-pointer items-center justify-center rounded-md px-1  transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100  ${
              open ? 'bg-indigo-400 text-white' : 'bg-transparent'
            }`}
            onFocus={(e) => {
              e.target.blur()
            }}
          >
            {currentLabel}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-2 flex max-w-max -translate-x-1/2 px-4 ">
              <div className="shadow-upper box-border flex w-60 select-none flex-col items-center justify-center gap-4 rounded-xl bg-white p-4 drop-shadow transition duration-1000 ease-in-out">
                <div className="flex w-full  flex-col  items-start gap-2 py-0">
                  <span className="text-sm font-medium font-normal leading-5 text-gray-900">开关单词发音</span>
                  <div className="flex w-full flex-row items-center justify-between">
                    <Switch checked={pronunciationConfig.isOpen} onChange={onChangePronunciationIsOpen} className="switch-root">
                      <span aria-hidden="true" className="switch-thumb" />
                    </Switch>
                    <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                      pronunciationConfig.isOpen ? '开启' : '关闭'
                    }`}</span>
                  </div>
                </div>
                {pronunciationConfig.isOpen && (
                  <>
                    <div className="flex w-full  flex-col  items-start gap-2 py-0">
                      <span className="text-sm font-medium font-normal leading-5 text-gray-900">开关循环发音</span>
                      <div className="flex w-full flex-row items-center justify-between">
                        <Switch checked={pronunciationConfig.isLoop} onChange={onChangePronunciationIsLoop} className="switch-root">
                          <span aria-hidden="true" className="switch-thumb" />
                        </Switch>
                        <span className="text-right text-xs font-normal leading-tight text-gray-600">{`循环已${
                          pronunciationConfig.isLoop ? '开启' : '关闭'
                        }`}</span>
                      </div>
                    </div>
                    <div className="flex w-full  flex-col  items-start gap-2 py-0">
                      <span className="text-sm font-medium font-normal leading-5 text-gray-900">单词发音口音</span>
                      <div className="flex w-full flex-row items-center justify-between">
                        <Listbox value={pronunciationConfig.type} onChange={onChangePronunciationType}>
                          <div className="relative">
                            <Listbox.Button className="relative w-40 cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none">
                              <span className="block truncate">{pronunciationConfig.name}</span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <FontAwesomeIcon icon="chevron-down" fixedWidth className="focus:outline-none" />
                              </span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg  focus:outline-none">
                                {pronunciationList.map((item) => (
                                  <Listbox.Option
                                    key={item.pron}
                                    className={({ active }) =>
                                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                      }`
                                    }
                                    value={item.pron}
                                  >
                                    {({ selected }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{item.name}</span>
                                        {selected ? (
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                            <FontAwesomeIcon icon="check" fixedWidth className="focus:outline-none" />
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
                    </div>
                  </>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default PronunciationSwitcher
