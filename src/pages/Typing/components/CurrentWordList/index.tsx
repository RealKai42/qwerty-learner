import { TypingContext } from '../../store'
import Progress from '../Progress'
import Drawer from '@/components/Drawer'
import Tooltip from '@/components/Tooltip'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import { Dialog } from '@headlessui/react'
import { atom, useAtomValue } from 'jotai'
import { useContext, useState } from 'react'
import MdiArrowRightCircle from '~icons/mdi/arrow-right-circle'
import IconX from '~icons/tabler/x'

const currentDictTitle = atom((get) => {
  return `${get(currentDictInfoAtom).name} 第 ${get(currentChapterAtom) + 1} 章`
})
export default function MyModal() {
  const { state } = useContext(TypingContext)!

  const [isOpen, setIsOpen] = useState(false)

  const currentDictTitleValue = useAtomValue(currentDictTitle)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <Tooltip content="展开" placement="top" className="!absolute left-5 top-[50%]">
        <button type="button" onClick={openModal} className="fixed left-0 top-[50%] text-lg focus:outline-none">
          <MdiArrowRightCircle className="text-indigo-500 dark:text-gray-50 " />
        </button>
      </Tooltip>

      <Drawer open={isOpen} onClose={closeModal} classNames="bg-stone-50 dark:bg-gray-900">
        <Dialog.Title as="h3" className="flex items-center justify-between p-4 text-lg font-medium leading-6 dark:text-gray-50">
          {currentDictTitleValue}
          <IconX onClick={closeModal} className="cursor-pointer" />
        </Dialog.Title>
        <div className="customized-scrollbar mt-2 select-none overflow-y-auto p-2 pb-2">
          {state.chapterData.words?.map((word, index) => {
            return (
              <div className="mb-2 rounded-xl bg-white p-2 shadow-sm dark:bg-gray-800" key={word.name}>
                <p className="font-mono text-lg leading-6 dark:text-gray-50">{word.name}</p>
                {index < state.chapterData.index && <div className="line-clamp-1 text-sm text-gray-400">{word.trans}</div>}
              </div>
            )
          })}
        </div>
        <div className="sticky bottom-0 w-full items-start justify-between rounded-t-lg bg-white px-4 pb-4 shadow dark:bg-gray-900 dark:text-gray-50">
          <div className="mb-2">当前进度:</div>
          <Progress className="w-full" />
        </div>
      </Drawer>
    </>
  )
}
