import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

type InfoPanelProps = {
  openState: boolean
  onClose: () => void
  title: string
  icon: IconProp
  iconColor: string
  iconBackgroundColor: string
  btnColor: string
  children: React.ReactNode
}

const InfoPanel: React.FC<InfoPanelProps> = ({ openState, title, onClose, icon, iconBackgroundColor, iconColor, btnColor, children }) => {
  return (
    <Transition.Root show={openState} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ">
                <div className="bg-white px-4 pt-5 pb-4 dark:bg-gray-800 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div
                      className={`${iconBackgroundColor} mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full dark:bg-opacity-50 sm:mx-0 sm:h-10 sm:w-10`}
                    >
                      <FontAwesomeIcon icon={icon} className={`h-5 w-5 stroke-current dark:bg-opacity-100  ${iconColor}`} />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">{children}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700  sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className={`${btnColor}  mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none  dark:bg-opacity-70 dark:text-opacity-80 sm:ml-3 sm:mt-0 sm:w-auto  sm:w-auto sm:text-sm`}
                    onClick={() => onClose()}
                  >
                    关闭
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default InfoPanel
