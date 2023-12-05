import { useRevisionWordCount } from '../hooks/useRevisionWordCount'
import { isInRevisionModeAtom, isRestartRevisionProgressAtom } from '@/store'
import { db } from '@/utils/db'
import { Popover, Transition } from '@headlessui/react'
import * as Progress from '@radix-ui/react-progress'
import { useSetAtom } from 'jotai'
import moment from 'moment'
import { Fragment, useState } from 'react'

type RevisionSwitcherProps = {
  dictId: string
  onConfirm: () => void
}

const RevisionSwitcher: React.FC<RevisionSwitcherProps> = ({ dictId, onConfirm }: RevisionSwitcherProps) => {
  const [revisionIndex, setRevisionIndex] = useState<number | undefined>(0)
  const [createdTime, setCreatedTime] = useState<number | undefined>(0)
  const setRevisionMode = useSetAtom(isInRevisionModeAtom)
  const revisionWordCount = useRevisionWordCount(dictId)
  const setRestartRevision = useSetAtom(isRestartRevisionProgressAtom)
  const onContinueProgress = () => {
    onConfirm()
    setRevisionMode(true)
  }
  const onCreateNewProgress = () => {
    onConfirm()
    setRevisionMode(true)
    setRestartRevision(true)
  }

  const fetchRevisionIndex = async () => {
    let index, timeStamp
    await db.revisionDictRecords
      .where('dict')
      .equals(dictId)
      .first((record) => {
        index = record?.revisionIndex
        timeStamp = record?.createdTime
        console.log('index', index)
        console.log('timeStamp', timeStamp)
      })
    setRevisionIndex(index)
    setCreatedTime(timeStamp)
  }

  // useEffect(() => {

  //   fetchRevisionIndex()
  // }, [dictId])

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`flex h-8 min-w-max cursor-pointer items-center justify-center rounded-md border-2 px-2 text-gray-700 transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100  ${
              open ? 'bg-indigo-400 text-white' : 'bg-transparent'
            }`}
            onFocus={(e) => {
              e.target.blur()
            }}
            onClick={fetchRevisionIndex}
          >
            复习错误单词
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
            <Popover.Panel className="absolute left-0 z-20 mt-2 flex max-w-max -translate-x-1/2 px-4 ">
              <div className="shadow-upper box-border flex w-60 select-none flex-col items-center justify-center gap-3 rounded-xl bg-white p-4 text-gray-700 drop-shadow transition duration-1000 ease-in-out dark:bg-gray-800 dark:text-gray-200">
                {revisionWordCount === 0 ? (
                  <span className="text-sm">暂无错误单词，快去练习吧</span>
                ) : (
                  <>
                    <div className="flex w-full flex-col items-start py-0">
                      <span>复习进度</span>
                    </div>
                    {revisionIndex === undefined || createdTime === undefined ? (
                      <span>暂无进度</span>
                    ) : (
                      <>
                        <div className="flex w-full flex-col items-start gap-0 py-0">
                          <div className=" flex w-full items-center py-0">
                            <Progress.Root
                              value={revisionIndex}
                              max={revisionWordCount}
                              className="mr-4 h-2 w-full rounded-full border  border-indigo-400 bg-white"
                            >
                              <Progress.Indicator
                                className="h-full rounded-full bg-indigo-400 pl-0"
                                style={{ width: `calc(${(revisionIndex / revisionWordCount) * 100}% )` }}
                              />
                            </Progress.Root>
                            <span className="p-0 text-xs">
                              {revisionIndex}/{revisionWordCount}
                            </span>
                          </div>
                          <span className="text-xs">({moment(createdTime).format('YYYY-MM-DD HH:mm:ss')}创建)</span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {revisionWordCount !== 0 && (
                  <div className="flex w-full items-start justify-center gap-3">
                    {revisionIndex !== undefined && createdTime !== undefined && (
                      <button
                        className="my-btn-primary flex-1 px-1 text-sm disabled:bg-gray-300"
                        type="button"
                        title="继续当前进度"
                        onClick={onContinueProgress}
                      >
                        继续当前进度
                      </button>
                    )}
                    <button
                      className="my-btn-primary max-w-[98px] flex-1 px-1 text-sm disabled:bg-gray-300"
                      type="button"
                      title="创建新进度"
                      onClick={onCreateNewProgress}
                    >
                      创建新进度
                    </button>
                  </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default RevisionSwitcher
