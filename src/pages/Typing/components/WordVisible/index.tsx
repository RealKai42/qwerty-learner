import { TypingContext, TypingStateActionType } from '../../store'
import type { WordVisibleOption } from '@/typings'
import { Popover, Transition } from '@headlessui/react'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { Fragment, useContext } from 'react'
import IconEyeSlash from '~icons/heroicons/eye-slash-solid'
import IconEye from '~icons/heroicons/eye-solid'

const wordVisibleOptions: WordVisibleOption[] = ['allVisible', 'partVisible', 'noVisible']
export default function WordVisible() {
  const { state, dispatch } = useContext(TypingContext) ?? {}
  const onChangeWordVisible = (value: WordVisibleOption) => {
    if (dispatch) {
      dispatch({ type: TypingStateActionType.TOGGLE_WORD_VISIBLE, payload: { wordVisible: value } })
    }
  }
  const isWordVisible = (wordVisible: WordVisibleOption) => {
    return ['allVisible', 'partVisible'].includes(wordVisible)
  }
  return (
    <>
      <Popover className="relative">
        <Popover.Button
          className={`p-[2px] ${
            isWordVisible(state?.wordVisible as WordVisibleOption) ? 'text-gray-500' : 'text-indigo-500'
          } rounded text-lg hover:bg-indigo-400 hover:text-white focus:outline-none `}
          type="button"
          aria-label="选择单词的显示形式"
        >
          <div
            className={`p-[2px] ${
              isWordVisible(state?.wordVisible as WordVisibleOption) ? 'text-indigo-500' : 'text-gray-500'
            } text-lg focus:outline-none`}
            aria-label="选择单词的显示形式"
          >
            {isWordVisible(state?.wordVisible as WordVisibleOption) ? <IconEye className="icon" /> : <IconEyeSlash className="icon" />}
          </div>
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
            <div className="shadow-upper box-border flex w-60 select-none flex-col items-center justify-center gap-4 rounded-xl bg-white p-4 drop-shadow dark:bg-gray-800">
              <div className="flex w-full  flex-col  items-start gap-2 py-0">
                <span className="text-sm font-normal leading-5 text-gray-900 dark:text-white dark:text-opacity-60">选择单词的显示形式</span>
                <div className="flex w-full flex-row items-center justify-between">
                  <RadioGroup.Root
                    defaultValue={state?.wordVisible.toString()}
                    className="flex w-full flex-col gap-2.5"
                    aria-label="选择单词的显示形式"
                  >
                    {wordVisibleOptions.map((value, index) => (
                      <div className="flex w-full items-center" key={value}>
                        <RadioGroup.Item
                          className="h-[25px] w-[25px] cursor-pointer rounded-full bg-white shadow-[0_2px_10px]  shadow-gray-300 outline-none hover:bg-indigo-100"
                          value={value.toString()}
                          onClick={() => onChangeWordVisible(value)}
                          id={`r${index}`}
                        >
                          <RadioGroup.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-[11px] after:w-[11px] after:rounded-[50%] after:bg-indigo-600 after:content-['']" />
                        </RadioGroup.Item>
                        <label
                          className="flex-1 cursor-pointer pl-[15px] text-[15px] leading-none"
                          htmlFor={`r${index}`}
                          onClick={() => onChangeWordVisible(value)}
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </RadioGroup.Root>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  )
}
