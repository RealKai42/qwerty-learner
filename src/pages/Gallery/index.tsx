import React from 'react'
import Layout from 'components/Layout'
import DictionaryGroup from './DictionaryGroup'
import Header from 'components/Header'
import { NavLink, useHistory } from 'react-router-dom'
import { useDictionaries, useSelectedDictionary } from 'store/AppState'
import { groupBy } from 'lodash'
import { useHotkeys } from 'react-hotkeys-hook'
import ChapterGroup from './ChapterGroup'
import Tooltip from 'components/Tooltip'

const GalleryPage: React.FC = () => {
  const dictionaries = useDictionaries()
  const selectedDictionary = useSelectedDictionary()
  const groups = Object.entries(groupBy(dictionaries, (dict) => dict.category))
  const history = useHistory()
  useHotkeys('enter,esc', () => {
    history.push('/')
  })

  return (
    <Layout>
      <Header>
        <Tooltip content="快捷键 Enter or Esc">
          <NavLink className="bg-indigo-400 text-white dark:text-opacity-80 text-lg px-6 py-1 rounded-lg focus:outline-none" to="/">
            返回练习
          </NavLink>
        </Tooltip>
      </Header>
      <div className="mt-auto mb-auto flex w-auto space-x-4 overflow-y-auto">
        <div className="bg-indigo-50 dark:bg-blue-gray-800 rounded-lg p-6 space-y-2 overflow-y-auto flex flex-col">
          <h2 className="sticky top-0 mb-4 font-bold text-lg text-gray-700 dark:text-white dark:text-opacity-70 text-shadow z-10">
            词典选择
          </h2>
          <div className="overflow-y-auto">
            {groups.map(([name, items]) => (
              <DictionaryGroup key={name} title={name} dictionaries={items} />
            ))}
          </div>
        </div>
        <div className="p-6 overflow-y-auto bg-indigo-50 dark:bg-blue-gray-800 rounded-lg flex flex-col">
          <h2 className="sticky top-0 mb-4 font-bold text-lg text-gray-700 dark:text-white dark:text-opacity-70 text-shadow z-10">
            章节选择
          </h2>
          {/* TODO: remove magic number here. */}
          <div className="overflow-y-auto">
            <ChapterGroup count={Math.ceil(selectedDictionary.length / 20)} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

GalleryPage.displayName = 'GalleryPage'

export default GalleryPage
