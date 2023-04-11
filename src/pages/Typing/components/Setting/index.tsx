import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, Tab, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { Fragment, useState } from 'react'

export default function Setting() {
  const [isOpen, setIsOpen] = useState(true)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`flex items-center justify-center rounded p-[2px] py-[3px] text-lg text-indigo-400 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white  ${
          isOpen ? 'bg-indigo-400 text-white' : ''
        }`}
      >
        <FontAwesomeIcon icon="gear" fixedWidth className="focus:outline-none" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                <Dialog.Panel className="flex w-200 flex-col overflow-hidden rounded-2xl bg-white p-0 shadow-xl">
                  <div className="relative flex h-22 items-end justify-between rounded-t-lg border-b border-neutral-200 bg-stone-50 px-6 py-3">
                    <span className="text-3xl font-bold text-gray-700">设置</span>
                    <FontAwesomeIcon
                      icon={['fas', 'times']}
                      className="absolute right-7 top-5 text-gray-400"
                      size="lg"
                      onClick={() => setIsOpen(false)}
                    />
                  </div>

                  <Tab.Group vertical>
                    <div className="flex h-120 w-full ">
                      <Tab.List className="flex h-full w-52 flex-col items-start space-y-3 border-r border-neutral-200 bg-stone-50 px-6 py-3">
                        <Tab
                          className={({ selected }) =>
                            classNames(
                              'flex h-14 w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 ring-0 focus:outline-none',
                              selected && 'bg-gray-200 bg-opacity-50',
                            )
                          }
                        >
                          <FontAwesomeIcon icon="ear-listen" className="mr-2" size="1x" />
                          <span className="text-neutral-500">音效设置</span>
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            classNames(
                              'flex h-14 w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 ring-0 focus:outline-none',
                              selected && 'bg-gray-200 bg-opacity-50',
                            )
                          }
                        >
                          <FontAwesomeIcon icon="sliders" className="mr-2" size="1x" />
                          <span className="text-neutral-500">高级设置</span>
                        </Tab>
                      </Tab.List>

                      <Tab.Panels className="h-full w-full flex-1">
                        <Tab.Panel className="h-full w-full px-6 py-3 focus:outline-none">
                          <h1>账号设置1</h1>
                        </Tab.Panel>
                        <Tab.Panel className="h-full w-full px-6 py-3 focus:outline-none">
                          <h1>账号设置2</h1>
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
