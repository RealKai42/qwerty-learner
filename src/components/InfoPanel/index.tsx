import React, { MouseEvent } from 'react'
import { Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

type InfoPanelProps = {
  state: boolean
  buttonOnclick: (e: MouseEvent) => void
  icon: IconProp
  color: string
  btnColor: string
  iconColor: string
  children: React.ReactNode
}

const InfoPanel: React.FC<InfoPanelProps> = ({ state, buttonOnclick, icon, color, iconColor, btnColor, children }) => {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <Transition
          show={state}
          enter="ease-out duration-30"
          enterFrom="opacity-0 "
          enterTo="opacity-100 "
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        </Transition>
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>
        <Transition
          show={state}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0  sm:scale-95"
        >
          {(ref) => (
            <div
              className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle "
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md dark:bg-opacity-70 ${color} sm:mx-0 sm:h-10 sm:w-10 `}
                  >
                    <FontAwesomeIcon icon={icon} className={`h-5 w-5 stroke-current  ${iconColor}`} />
                  </div>

                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">{children}</div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700 dark:bg-opacity-10 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 shadow-sm ${btnColor} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-opacity-70 dark:text-opacity-80 sm:ml-3 sm:w-auto sm:text-sm `}
                  onClick={buttonOnclick}
                >
                  {'关闭'}
                </button>
              </div>
            </div>
          )}
        </Transition>
      </div>
    </div>
  )
}

export default InfoPanel
