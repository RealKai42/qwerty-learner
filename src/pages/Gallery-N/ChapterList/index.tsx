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

          <div className="w-full h-full fixed inset-0">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300 transform"
              enterFrom="translate-x-full "
              enterTo=""
              leave="transition ease-in duration-500 transform"
              leaveFrom=""
              leaveTo="translate-x-full "
            >
              <Dialog.Panel className="w-100 bg-white h-full absolute right-0 duration-300 ease-out transition-all flex flex-col drop-shadow-2xl">
                {dict && (
                  <>
                    <div className="py-4 pl-5 text-lg block">{dict.name}</div>
                    <div className="flex-1 overflow-y-auto w-full">
                      <table className="min-w-full divide-y divide-gray-200 block">
                        <thead className="bg-gray-50 h-10 block sticky top-0 w-full">
                          <tr className="flex">
                            <th scope="col" className="px-2 py-3 w-15  text-center text-sm font-bold text-gray-600 tracking-wider"></th>
                            <th scope="col" className="px-2 py-3 flex-1  text-center text-sm font-bold text-gray-600 tracking-wider">
                              Chapter
                            </th>
                            <th scope="col" className="px-2 py-3 flex-1  text-center text-sm font-bold text-gray-600 tracking-wider">
                              练习次数
                            </th>
                            <th scope="col" className="px-2 py-3 flex-1  text-center text-sm font-bold text-gray-600 tracking-wider">
                              平均错误数
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 h-full w-full overflow-y-scroll block">
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
