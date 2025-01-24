import { TypingContext, TypingStateActionType } from '../../store'
import AdvancedSetting from './AdvancedSetting'
import DataSetting from './DataSetting'
import SoundSetting from './SoundSetting'
import ViewSetting from '@/pages/Typing/components/Setting/ViewSetting'
import { Dialog, Tab, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { Fragment, cloneElement, useContext, useState } from 'react'
import IconCog6Tooth from '~icons/heroicons/cog-6-tooth-solid'
import IconEye from '~icons/heroicons/eye-solid'
import IconAdjustmentsHorizontal from '~icons/tabler/adjustments-horizontal'
import IconDatabaseCog from '~icons/tabler/database-cog'
import IconEar from '~icons/tabler/ear'
import IconX from '~icons/tabler/x'

export default function Setting() {
  const [isOpen, setIsOpen] = useState(false)
  const { dispatch } = useContext(TypingContext) ?? {}

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
    if (dispatch) {
      dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white  ${
          isOpen && 'bg-indigo-500 text-white'
        }`}
        title="打开设置对话框"
      >
        <IconCog6Tooth className="icon" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex flex-col overflow-hidden rounded-2xl bg-white p-0 shadow-xl dark:bg-gray-800">
                  <div className="relative flex h-16 items-center justify-between rounded-t-lg border-b border-neutral-100 bg-stone-50 px-6 py-3 dark:border-neutral-700 dark:bg-gray-900">
                    <span className="flex items-center justify-between text-2xl font-bold text-gray-600 dark:text-gray-50">设置</span>
                    <button type="button" onClick={() => setIsOpen(false)} title="关闭对话框">
                      <IconX className="cursor-pointer text-gray-400" />
                    </button>
                  </div>

                  <Tab.Group>
                    <div className="flex h-[32rem] w-full ">
                      <Tab.List className="items-start space-y-1 border-r border-neutral-100 bg-stone-50 p-2 dark:border-transparent dark:bg-gray-900 sm:p-4">
                        <TabButton label="音效" icon={<IconEar />} />
                        <TabButton label="高级" icon={<IconAdjustmentsHorizontal />} />
                        <TabButton label="显示" icon={<IconEye />} />
                        <TabButton label="数据" icon={<IconDatabaseCog />} />
                      </Tab.List>

                      <Tab.Panels className="h-full w-96 flex-1 sm:w-150">
                        <Tab.Panel className="flex h-full focus:outline-none">
                          <SoundSetting />
                        </Tab.Panel>
                        <Tab.Panel className="flex h-full focus:outline-none">
                          <AdvancedSetting />
                        </Tab.Panel>
                        <Tab.Panel className="flex h-full focus:outline-none">
                          <ViewSetting />
                        </Tab.Panel>
                        <Tab.Panel className="flex h-full focus:outline-none">
                          <DataSetting />
                        </Tab.Panel>
                      </Tab.Panels>
                    </div>
                  </Tab.Group>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

const TabButton = (props: { icon: React.ReactNode; label: string }) => {
  return (
    <Tab
      className={({ selected }) =>
        classNames(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg px-4 py-2 ring-0 focus:outline-none sm:flex-row',
          selected && 'bg-gray-200 bg-opacity-50 dark:bg-gray-800',
        )
      }
    >
      {cloneElement(props.icon as React.ReactElement, { className: 'mr-0 sm:mr-2 text-neutral-500 dark:text-neutral-300' })}
      <span className="text-nowrap text-neutral-500 dark:text-neutral-300">{props.label}</span>
    </Tab>
  )
}
