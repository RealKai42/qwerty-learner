import React from 'react'
import Layout from '@/components/Layout'
import DictionaryGroup from './DictionaryGroup'
import Header from '@/components/Header'
import { NavLink, useHistory } from 'react-router-dom'
import { useDictionaries, useSelectedDictionary } from '@/store/AppState'
import { groupBy } from 'lodash'
import { useHotkeys } from 'react-hotkeys-hook'
import ChapterGroup from './ChapterGroup'
import Tooltip from '@/components/Tooltip'

const GalleryPage: React.FC = () => {
  const dictionaries = useDictionaries()
  const selectedDictionary = useSelectedDictionary()
  const groups = Object.entries(groupBy(dictionaries, (dict) => dict.category))
  const history = useHistory()
  useHotkeys('enter,esc', () => {
    history.push('/home')
  })

  return (
    <Layout>
      <Header>
        <Tooltip content="快捷键 Enter or Esc">
          <NavLink className="rounded-lg bg-indigo-400 px-6 py-1 text-lg text-white focus:outline-none dark:text-opacity-80" to="/home">
            完成选择
          </NavLink>
        </Tooltip>
      </Header>
      <div className="mt-auto mb-auto flex w-auto space-x-4 overflow-y-auto">
        <div className="flex flex-col space-y-2 overflow-y-auto rounded-lg bg-indigo-50 p-6 dark:bg-slate-800">
          <h2 className="text-shadow sticky top-0 z-10 mb-2 text-lg font-bold text-gray-700 dark:text-white dark:text-opacity-70">
            词典选择
          </h2>
          <div className="customized-scrollbar overflow-y-auto">
            {groups.map(([name, items]) => (
              <DictionaryGroup key={name} title={name} dictionaries={items} />
            ))}
          </div>
        </div>
        <div className="flex flex-col overflow-y-auto rounded-lg bg-indigo-50 p-6 dark:bg-slate-800">
          <h2 className="text-shadow sticky top-0 z-10 mb-4 text-lg font-bold text-gray-700 dark:text-white dark:text-opacity-70">
            章节选择
          </h2>
          <div className="customized-scrollbar overflow-y-auto">
            <ChapterGroup totalWords={selectedDictionary.length} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

GalleryPage.displayName = 'GalleryPage'

export default GalleryPage
