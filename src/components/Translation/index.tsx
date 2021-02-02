import React from 'react'

const Translation: React.FC<TranslationProps> = ({ trans }) => {
  return <div className="pt-6 pb-4 text-lg font-sans text-center">{trans}</div>
}

Translation.propTypes = {}

export type TranslationProps = {
  trans: string
}

export default Translation
