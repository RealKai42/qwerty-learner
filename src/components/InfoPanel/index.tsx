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
}

const InfoPanel: React.FC<InfoPanelProps> = ({ state, buttonOnclick, icon, color, iconColor, btnColor, children }) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
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
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full "
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md dark:bg-opacity-70 ${color} sm:mx-0 sm:h-10 sm:w-10 `}
                  >
                    <FontAwesomeIcon icon={icon} className={`h-10 w-10 stroke-current  ${iconColor}`} />
                  </div>

                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">{children}</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 dark:bg-opacity-10 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${btnColor} dark:bg-opacity-70 text-base font-medium text-white dark:text-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm `}
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
