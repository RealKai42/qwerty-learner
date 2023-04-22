import ChapterRow from './ChapterRow'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import range from '@/utils/range'
import { Dialog, Transition } from '@headlessui/react'
import { useAtom, useAtomValue } from 'jotai'
import { Fragment, useState } from 'react'

export default function ChapterList() {
  const [isOpen, setIsOpen] = useState(true)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const { id: dictID, chapterCount } = useAtomValue(currentDictInfoAtom)

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Open dialog
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                <div className="py-4 pl-5 text-lg block">IELTS</div>
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
                          平均正确率
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 h-full w-full overflow-y-scroll block">
                      {range(0, chapterCount, 1).map((index) => (
                        <ChapterRow key={`${dictID}-${index}`} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
