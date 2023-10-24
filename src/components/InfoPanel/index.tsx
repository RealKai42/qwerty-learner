import { Dialog, Transition } from '@headlessui/react'
import classNames from 'classnames'
import type { ElementType, SVGProps } from 'react'
import type React from 'react'
import { Fragment } from 'react'

type InfoPanelProps = {
  openState: boolean
  onClose: () => void
  title: string
  icon: ElementType<SVGProps<SVGSVGElement>>
  iconClassName: string
  buttonClassName: string
  children: React.ReactNode
}

const InfoPanel: React.FC<InfoPanelProps> = ({ openState, title, onClose, icon: Icon, iconClassName, buttonClassName, children }) => {
  return (
    <Transition.Root show={openState} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => onClose()}>
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
                <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div
                      className={classNames(
                        iconClassName,
                        `mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full dark:bg-opacity-30 sm:mx-0 sm:h-10 sm:w-10`,
                      )}
                    >
                      <Icon className="h-6 w-6 stroke-current dark:bg-opacity-100" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">{children}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700  sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" className={classNames(buttonClassName, 'my-btn-info-panel ')} onClick={() => onClose()}>
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
