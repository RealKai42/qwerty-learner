import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Fragment, useCallback } from 'react'
import { Popover, Transition, Switch } from '@headlessui/react'
import { useAtom } from 'jotai'
import { keySoundsConfigAtom, hintSoundsConfigAtom } from '@/store'

export default function SoundSwitcher() {
  const [keySoundsConfig, setKeySoundsConfig] = useAtom(keySoundsConfigAtom)
  const [hintSoundsConfig, setHintSoundsConfig] = useAtom(hintSoundsConfigAtom)

  const onChangeKeySound = useCallback(
    (checked: boolean) => {
      setKeySoundsConfig((old) => ({ ...old, isOpen: checked }))
    },
    [setKeySoundsConfig],
  )

  const onChangeHintSound = useCallback(
    (checked: boolean) => {
      setHintSoundsConfig((old) => ({ ...old, isOpen: checked }))
    },
    [setHintSoundsConfig],
  )

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-400 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white  ${
              open ? 'bg-indigo-400 text-white' : ''
            }`}
            onFocus={(e) => {
              e.target.blur()
            }}
          >
            <FontAwesomeIcon icon="volume-up" fixedWidth className="focus:outline-none" />
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
              <div className="shadow-upper box-border flex w-60 select-none flex-col items-center justify-center gap-4 rounded-xl bg-white p-4 drop-shadow">
                <div className="flex w-full  flex-col  items-start gap-2 py-0">
                  <span className="text-sm font-medium font-normal leading-5 text-gray-900">开关按键音</span>
                  <div className="flex w-full flex-row items-center justify-between">
                    <Switch checked={keySoundsConfig.isOpen} onChange={onChangeKeySound} className="switch-root">
                      <span aria-hidden="true" className="switch-thumb" />
                    </Switch>
                    <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                      keySoundsConfig.isOpen ? '开启' : '关闭'
                    }`}</span>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start  gap-2 py-0">
                  <span className="text-sm font-medium font-normal leading-5 text-gray-900">开关效果音</span>
                  <div className="flex w-full flex-row items-center justify-between">
                    <Switch checked={hintSoundsConfig.isOpen} onChange={onChangeHintSound} className="switch-root">
                      <span aria-hidden="true" className="switch-thumb" />
                    </Switch>
                    <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                      hintSoundsConfig.isOpen ? '开启' : '关闭'
                    }`}</span>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}