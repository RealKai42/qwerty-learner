import React from 'react'
import Layout from 'components/Layout'
import DictionaryCard from './DictionaryCard'
import Header from 'components/Header'
import { NavLink } from 'react-router-dom'
import { useDictionaries } from 'store/AppState'

const GalleryPage: React.FC = () => {
  const [dictionaries, setDictionary] = useDictionaries()
  return (
    <Layout>
      <Header>
        <NavLink className="bg-indigo-400 text-white text-lg px-6 py-1 rounded-lg focus:outline-none" to="/">
          返回练习
        </NavLink>
      </Header>
      <main className="mt-auto mb-auto grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {dictionaries.map((dict) => (
          <DictionaryCard key={dict.id} dictionary={dict} onClick={setDictionary} />
        ))}
      </main>
    </Layout>
  )
}

GalleryPage.displayName = 'GalleryPage'

export default GalleryPage
