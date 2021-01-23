import React from 'react'

const Translation: React.FC<TranslationProps> = ({ trans }) => {
  return <div>{trans}</div>
}

Translation.propTypes = {}

export type TranslationProps = {
  trans: string
}

export default Translation
