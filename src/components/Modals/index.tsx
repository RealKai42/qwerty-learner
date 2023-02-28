import React, { MouseEvent } from 'react'
import { Transition } from '@headlessui/react'
import { useHotkeys } from 'react-hotkeys-hook'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '@/components/Tooltip'

type ModalsProps = {
  state: boolean
  title: string
  content: string
  firstButton: string
  secondButton: string
  firstButtonClassName?: string
  secondButtonClassName?: string
  firstButtonOnclick: (e: MouseEvent) => void
  secondButtonOnclick: (e: MouseEvent) => void
  thirdButton?: string
  thirdButtonOnclick?: (e: MouseEvent) => void
  thirdButtonHotkey?: string
}

const Modals: React.FC<ModalsProps> = ({
  state,
  title,
  content,
  firstButton,
  secondButton,
  firstButtonClassName,
  secondButtonClassName,
  firstButtonOnclick,
  secondButtonOnclick,
  thirdButton,
  thirdButtonOnclick,
  thirdButtonHotkey = '',
}) => {
  useHotkeys('enter', () => {
    const e: MouseEvent = null as unknown as MouseEvent
    firstButtonOnclick(e)
  })

  useHotkeys('shift+enter', () => {
    const e: MouseEvent = null as unknown as MouseEvent
    secondButtonOnclick(e)
  })

  useHotkeys(thirdButtonHotkey, () => {
    const e: MouseEvent = null as unknown as MouseEvent
    if (thirdButtonOnclick) thirdButtonOnclick(e)
  })

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
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
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
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-y-0 sm:scale-95"
        >
          {(ref) => (
            <div
              className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <FontAwesomeIcon icon="book-reader" className="h-10 w-10 stroke-current text-indigo-500 dark:text-indigo-400" />
                  </div>

                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white dark:text-opacity-70" id="modal-headline">
                      {title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{content}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700 dark:bg-opacity-10 sm:flex sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse sm:px-6">
                <Tooltip content="快捷键 Enter">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-opacity-80 sm:w-auto sm:text-sm ${firstButtonClassName}`}
                    onClick={firstButtonOnclick}
                  >
                    {firstButton}
                  </button>
                </Tooltip>

                <Tooltip content="快捷键 Shift + Enter">
                  <button
                    type="button"
                    className={`mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:text-opacity-60 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto sm:text-sm ${
                      secondButtonClassName ?? ''
                    }`}
                    onClick={secondButtonOnclick}
                  >
                    {secondButton}
                  </button>
                </Tooltip>

                {thirdButton && thirdButtonOnclick && (
                  <Tooltip content={`快捷键 ${thirdButtonHotkey}`}>
                    <button
                      type="button"
                      className={`mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:text-opacity-60 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto sm:text-sm ${
                        secondButtonClassName ?? ''
                      }`}
                      onClick={thirdButtonOnclick}
                    >
                      {thirdButton}
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        </Transition>
      </div>
    </div>
  )
}

export default Modals
