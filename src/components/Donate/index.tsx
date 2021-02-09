import React, { MouseEvent } from 'react'
import { Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import alipay from 'assets/alipay.png'

type DonateProps = {
  state: boolean
  buttonOnclick: (e: MouseEvent) => void
}

const Donate: React.FC<DonateProps> = ({ state, buttonOnclick }) => {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <Transition
          show={state}
          enter="ease-out duration-30"
          enterFrom="opacity-0 "
          enterTo="opacity-100 "
          leave="esae-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
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
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-y-0 sm:scale-95"
        >
          {(ref) => (
            <div
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FontAwesomeIcon icon="coffee" className="h-10 w-10 stroke-current text-yellow-500" />
                  </div>

                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white dark:text-opacity-70" id="modal-headline">
                      Buy me a coffee
                    </h3>
                    <div className="mt-2 ">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        非常感谢大家使用 Qwerty Learner,
                        目前该网站由三个人用业余时间在维护，我们希望在未来购买独立的域名(目前使用vercel部署)，并购买服务器以方便国内用户访问与云同步存储数据。
                      </p>
                      <br />
                      <p className="text-sm text-gray-700 dark:text-gray-200">如果您喜欢我们软件，非常感谢您对我们未来的支持!</p>
                      <br />
                      <img className="w-2/6 ml-1 " src={alipay} alt="alipay" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 dark:bg-opacity-10 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-300 dark:bg-yellow-500 text-base font-medium text-white dark:text-opacity-80 hover:bg-yellow-400 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm `}
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

export default Donate
