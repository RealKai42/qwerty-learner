import Tooltip from '@/components/Tooltip'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import range from '@/utils/range'
import { Listbox, Transition } from '@headlessui/react'
import { useAtom, useAtomValue } from 'jotai'
import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import IconCheck from '~icons/tabler/check'

export const DictChapterButton = () => {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const chapterCount = currentDictInfo.chapterCount

  return (
    <>
      <Tooltip content="词典切换">
        <NavLink
          className="block rounded-lg px-3 py-1 text-lg transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100"
          to="/gallery"
        >
          {currentDictInfo.name}
        </NavLink>
      </Tooltip>
      <Tooltip content="章节切换">
        <Listbox value={currentChapter} onChange={setCurrentChapter}>
          <Listbox.Button className="rounded-lg px-3 py-1 text-lg transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white focus:outline-none dark:text-white dark:text-opacity-60 dark:hover:text-opacity-100">
            第 {currentChapter + 1} 章
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="listbox-options z-10 w-32">
              {range(0, chapterCount, 1).map((index) => (
                <Listbox.Option key={index} value={index}>
                  {({ selected }) => (
                    <div className="group flex cursor-pointer items-center justify-between">
                      {selected ? (
                        <span className="listbox-options-icon">
                          <IconCheck className="focus:outline-none" />
                        </span>
                      ) : null}
                      <span>第 {index + 1} 章</span>
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </Tooltip>
    </>
  )
}
