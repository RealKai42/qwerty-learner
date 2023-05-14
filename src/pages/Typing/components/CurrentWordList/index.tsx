import { TypingContext } from '../../store'
import Progress from '../Progress'
import Drawer from '@/components/Drawer'
import { Dialog } from '@headlessui/react'
import { useContext, useState } from 'react'
import MdiArrowRightCircle from '~icons/mdi/arrow-right-circle'
import IconX from '~icons/tabler/x'

export default function MyModal() {
  const { state } = useContext(TypingContext)!
  const [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button type="button" onClick={openModal} className="fixed left-0 top-[50%] ">
        <MdiArrowRightCircle className="text-indigo-500 dark:text-gray-50 " />
      </button>

      <Drawer open={isOpen} onClose={closeModal}>
        <Dialog.Title as="h3" className="flex items-center justify-between text-lg font-medium leading-6 dark:text-gray-50">
          本章单词
          <IconX onClick={closeModal} className="cursor-pointer" />
        </Dialog.Title>
        <div className="mt-2 select-none overflow-y-auto p-2 pb-12">
          {state.chapterData.words?.map((word, index) => {
            return (
              <div key={word.name}>
                <p className="font-mono leading-6 dark:text-gray-50">{word.name}</p>
                {index < state.chapterData.index && <div className="line-clamp-1 text-sm text-gray-400">{word.trans}</div>}
              </div>
            )
          })}
        </div>
        <div className="fixed bottom-0 flex w-full items-start justify-between bg-white px-1 pb-4 dark:bg-gray-800 dark:text-gray-50">
          <div>当前进度:</div>
          <Progress />
        </div>
      </Drawer>
    </>
  )
}
