import { loopWordConfigAtom } from '@/store'
import type { LoopWordTimesOption } from '@/typings'
import { Popover, Transition } from '@headlessui/react'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { useAtom } from 'jotai'
import { Fragment, useCallback, useState } from 'react'
import IconRepeat from '~icons/tabler/repeat'
import IconRepeatOff from '~icons/tabler/repeat-off'

const loopOptions: LoopWordTimesOption[] = [1, 3, 5, 8, Number.MAX_SAFE_INTEGER]
export default function LoopWordSwitcher() {
  const [{ times: loopTimes }, setLoopWordConfig] = useAtom(loopWordConfigAtom)
  const [isOpen, setIsOpen] = useState(false)

  const onChangeLoopTimes = useCallback(
    (value: number) => {
      setLoopWordConfig((old) => ({
        ...old,
        times: value,
      }))
    },
    [setLoopWordConfig],
  )

  return (
    <>
      <Popover className="relative">
        <Popover.Button
          className={`p-[2px] ${
            loopTimes === 1 ? 'text-gray-500' : 'text-indigo-500'
          } rounded text-lg hover:bg-indigo-400 hover:text-white focus:outline-none `}
          type="button"
          onClick={(e) => {
            setIsOpen(!isOpen)
            e.currentTarget.blur()
          }}
          aria-label="选择单词的循环次数"
        >
          <div className="relative">
            {loopTimes === 1 ? (
              <IconRepeatOff />
            ) : (
              <>
                <IconRepeat />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.7] transform font-mono text-xs font-bold">
                  {loopTimes === Number.MAX_SAFE_INTEGER ? '' : loopTimes}
                </span>
              </>
            )}
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
                <span className="text-sm font-normal leading-5 text-gray-900 dark:text-white dark:text-opacity-60">选择单词的循环次数</span>
                <div className="flex w-full flex-row items-center justify-between">
                  <RadioGroup.Root
                    className="flex w-full flex-col gap-2.5"
                    defaultValue={loopTimes.toString()}
                    aria-label="选择单词的循环次数"
                  >
                    {loopOptions.map((value, index) => (
                      <div className="flex w-full items-center" key={value}>
                        <RadioGroup.Item
                          className="h-[25px] w-[25px] cursor-pointer rounded-full bg-white shadow-[0_2px_10px]  shadow-gray-300 outline-none hover:bg-indigo-100"
                          value={value.toString()}
                          onClick={() => onChangeLoopTimes(value)}
                          id={`r${index}`}
                        >
                          <RadioGroup.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-[11px] after:w-[11px] after:rounded-[50%] after:bg-indigo-600 after:content-['']" />
                        </RadioGroup.Item>
                        <label
                          className="flex-1 cursor-pointer pl-[15px] text-[15px] leading-none dark:text-white dark:text-opacity-60"
                          htmlFor={`r${index}`}
                          onClick={() => onChangeLoopTimes(value)}
                        >
                          {value === Number.MAX_SAFE_INTEGER ? '无限' : value}
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
