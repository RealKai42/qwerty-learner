import { TypingContext, TypingStateActionType } from '../../store'
import { Transition, Popover } from '@headlessui/react'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { useContext, useState, Fragment } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import IconRepeatOff from '~icons/tabler/repeat-off'
import IconRepeatOnce from '~icons/tabler/repeat-once'

const options = [1, 3, 5, 8, 10, Number.MAX_SAFE_INTEGER]
const LoopWordSwitcher = () => {
  const [loopValue, setLoopValue] = useState(options[options.length - 1])
  const [isOpen, setIsOpen] = useState(false)
  const { state, dispatch } = useContext(TypingContext) ?? {}
  const changeLoopSingleWordState = () => {
    setIsOpen(!isOpen)
    if (dispatch) {
      dispatch({ type: TypingStateActionType.TOGGLE_IS_LOOP_SINGLE_WORD })
    }
  }
  useHotkeys(
    'ctrl+l',
    () => {
      changeLoopSingleWordState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
  return (
    <>
      <Popover className="relative">
        <Popover.Button
          className={`p-[2px] ${state?.isLoopSingleWord ? 'text-indigo-500' : 'text-gray-500'} text-lg focus:outline-none`}
          type="button"
          onClick={(e) => {
            setIsOpen(!isOpen)
            changeLoopSingleWordState()
            e.currentTarget.blur()
          }}
          aria-label="开关单个单词循环（Ctrl + L）"
        >
          {state?.isLoopSingleWord ? <IconRepeatOnce /> : <IconRepeatOff />}
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
                <span className="text-sm font-normal leading-5 text-gray-900 dark:text-white dark:text-opacity-60">选择重复次数</span>
                <div className="flex w-full flex-row items-center justify-between">
                  <form>
                    <RadioGroup.Root className="flex flex-col gap-2.5" defaultValue={loopValue.toString()} aria-label="View density">
                      {options.map((value) => (
                        <div className="flex items-center" key={value}>
                          <RadioGroup.Item
                            className="h-[25px] w-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA7  outline-none hover:bg-violet3"
                            value={value.toString()}
                            onClick={() => {
                              setLoopValue(value)
                              if (dispatch) {
                                dispatch({ type: TypingStateActionType.SET_LOOP_WORD_TIMES, payload: value })
                              }
                            }}
                            id="r1"
                          >
                            <RadioGroup.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-[11px] after:w-[11px] after:rounded-[50%] after:bg-violet11 after:content-['']" />
                          </RadioGroup.Item>
                          <label className="pl-[15px] text-[15px] leading-none" htmlFor="r1">
                            {value === Number.MAX_SAFE_INTEGER ? '无限' : value}
                          </label>
                        </div>
                      ))}
                    </RadioGroup.Root>
                  </form>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  )
}

export default LoopWordSwitcher
