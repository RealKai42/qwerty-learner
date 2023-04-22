import { GalleryContext } from '..'
import ChapterRow from './ChapterRow'
import { currentChapterAtom, currentDictIdAtom } from '@/store'
import { calcChapterCount } from '@/utils'
import range from '@/utils/range'
import { Dialog, Transition } from '@headlessui/react'
import { useAtom } from 'jotai'
import { Fragment, useContext } from 'react'

export default function ChapterList() {
  const {
    state: { chapterListDict: dict },
    setState,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = useContext(GalleryContext)!

  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)

  const chapterCount = calcChapterCount(dict?.length ?? 0)
  const showChapterList = dict !== null
  const checkedIndex = dict?.id === currentDictId ? currentChapter : 0

  const onChangeChapter = (index: number) => {
    if (dict) {
      setCurrentChapter(index)
      setCurrentDictId(dict?.id ?? '')
    }
  }

  const onCloseDialog = () => {
    setState((state) => {
      state.chapterListDict = null
    })
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
              leave="transition ease-in duration-500 transform"
              leaveFrom=""
              leaveTo="translate-x-full "
            >
              <Dialog.Panel className="absolute right-0 flex h-full w-100 flex-col bg-white drop-shadow-2xl transition-all duration-300 ease-out">
                {dict && (
                  <>
                    <div className="block py-4 pl-5 text-lg">{dict.name}</div>
                    <div className="w-full flex-1 overflow-y-auto">
                      <table className="block min-w-full divide-y divide-gray-200">
                        <thead className="sticky top-0 block h-10 w-full bg-gray-50">
                          <tr className="flex">
                            <th scope="col" className="w-15 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600"></th>
                            <th scope="col" className="flex-1 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600">
                              Chapter
                            </th>
                            <th scope="col" className="flex-1 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600">
                              练习次数
                            </th>
                            <th scope="col" className="flex-1 px-2 py-3  text-center text-sm font-bold tracking-wider text-gray-600">
                              平均错误数
                            </th>
                          </tr>
                        </thead>
                        <tbody className="block h-full w-full divide-y divide-gray-200 overflow-y-scroll bg-white">
                          {range(0, chapterCount, 1).map((index) => (
                            <ChapterRow
                              key={`${dict.id}-${index}`}
                              index={index}
                              dictID={dict.id}
                              checked={checkedIndex === index}
                              onChange={onChangeChapter}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
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
