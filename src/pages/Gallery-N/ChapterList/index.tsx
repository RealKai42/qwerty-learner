import { GalleryContext } from '..'
import { useRevisionWordCount } from '../hooks/useRevisionWordCount'
import ChapterRow from './ChapterRow'
import RevisionSwitcher from './RevisionSwitcher'
import Tooltip from '@/components/Tooltip'
import { currentChapterAtom, currentDictIdAtom, isInRevisionModeAtom } from '@/store'
import { calcChapterCount } from '@/utils'
import range from '@/utils/range'
import { Dialog, Switch, Transition } from '@headlessui/react'
import { useAtom } from 'jotai'
import { Fragment, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconInfo from '~icons/ic/outline-info'
import IconX from '~icons/tabler/x'

export default function ChapterList() {
  const {
    state: { chapterListDict: dict },
    setState,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = useContext(GalleryContext)!

  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const [isRevisionMode, setRevisionMode] = useAtom(isInRevisionModeAtom)
  const [checkedChapter, setCheckedChapter] = useState(dict?.id === currentDictId ? currentChapter : 0)
  const navigate = useNavigate()

  const chapterCount = calcChapterCount(dict?.length ?? 0)
  const showChapterList = dict !== null
  const revisionWordCount = useRevisionWordCount(currentDictId)

  useEffect(() => {
    if (dict) {
      setCheckedChapter(dict.id === currentDictId ? currentChapter : 0)
    }
  }, [currentChapter, currentDictId, dict])

  const onChangeChapter = (index: number) => {
    setCheckedChapter(index)
  }

  const onConfirm = useCallback(() => {
    if (dict) {
      setCurrentChapter(checkedChapter)
      setCurrentDictId(dict.id)
      setState((state) => {
        state.chapterListDict = null
      })
      navigate('/')
    }
  }, [checkedChapter, dict, navigate, setCurrentChapter, setCurrentDictId, setState])

  const onCloseDialog = () => {
    setState((state) => {
      state.chapterListDict = null
    })
    setRevisionMode(false)
  }

  const onToggleRevisionMode = () => {
    setRevisionMode((old) => !old)
    setCheckedChapter(0)
  }

  return (
    <>
      <Transition appear show={showChapterList} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onCloseDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 h-full w-full">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300 transform"
              enterFrom="translate-x-full "
              enterTo=""
              leave="transition ease-in duration-300 transform"
              leaveFrom=""
              leaveTo="translate-x-full "
            >
              <Dialog.Panel className="absolute right-0 flex h-full w-[35rem] flex-col bg-white drop-shadow-2xl transition-all duration-300 ease-out dark:bg-gray-800">
                {dict && (
                  <>
                    <div className="flex w-full items-end justify-between py-4 pl-5">
                      <span className="text-lg text-gray-700 dark:text-gray-200">{dict.name}</span>
                      <div className="flex items-center gap-3">
                        <RevisionSwitcher dictId={dict?.id} onConfirm={onConfirm} />

                        <IconX className="mr-2 cursor-pointer text-gray-400" onClick={onCloseDialog} />
                      </div>
                    </div>

                    <div className="w-full flex-1 overflow-y-auto">
                      {isRevisionMode && revisionWordCount === 0 ? (
                        <div className="flex min-h-full items-center justify-center">
                          <span className="text-sm font-normal leading-5 text-gray-900 dark:text-white dark:text-opacity-60">
                            暂无错误单词
                          </span>
                        </div>
                      ) : (
                        <table className="block min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                          <thead className="sticky top-0 block h-10 w-full bg-gray-50 dark:bg-gray-700">
                            <tr className="flex">
                              <th
                                scope="col"
                                className="w-15 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600 dark:text-gray-200"
                              ></th>
                              <th
                                scope="col"
                                className="flex-1 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600 dark:text-gray-200"
                              >
                                Chapter
                              </th>
                              <th
                                scope="col"
                                className="flex-1 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600 dark:text-gray-200"
                              >
                                练习次数
                              </th>
                              <th
                                scope="col"
                                className="flex-1 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600 dark:text-gray-200"
                              >
                                平均错误单词数
                              </th>
                              <th
                                scope="col"
                                className="flex-1 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600 dark:text-gray-200"
                              >
                                平均错误输入数
                              </th>
                            </tr>
                          </thead>
                          <tbody className="block h-full w-full divide-y divide-gray-100 overflow-y-scroll bg-white dark:divide-gray-800">
                            {range(0, chapterCount, 1).map((index) => (
                              <ChapterRow
                                key={`${dict.id}-${index}`}
                                index={index}
                                dictID={dict.id}
                                checked={checkedChapter === index}
                                onChange={onChangeChapter}
                              />
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    <button className="text-bold h-15 w-full bg-indigo-400 text-white" onClick={onConfirm}>
                      确定
                    </button>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
