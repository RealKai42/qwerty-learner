import React from 'react'

const Translation: React.FC<TranslationProps> = ({ trans }) => {
  return <div className="pt-1 pb-3 text-xl font-normal text-center">{trans}</div>
}

Translation.propTypes = {}

export type TranslationProps = {
  trans: string
}

export default Translation
