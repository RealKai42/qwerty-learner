import React from 'react'
import Layout from 'components/Layout'
import DictionaryGroup from './DictionaryGroup'
import Header from 'components/Header'
import { NavLink } from 'react-router-dom'
import { useDictionaries } from 'store/AppState'
import { groupBy } from 'lodash'

const GalleryPage: React.FC = () => {
  const dictionaries = useDictionaries()
  const groups = Object.entries(groupBy(dictionaries, (dict) => dict.category))
  return (
    <Layout>
      <Header>
        <NavLink className="bg-indigo-400 text-white text-lg px-6 py-1 rounded-lg focus:outline-none" to="/">
          返回练习
        </NavLink>
      </Header>
      <div className="mt-auto mb-auto space-y-4">
        {groups.map(([name, items]) => (
          <DictionaryGroup key={name} title={name} dictionaries={items} />
        ))}
      </div>
    </Layout>
  )
}

GalleryPage.displayName = 'GalleryPage'

export default GalleryPage
