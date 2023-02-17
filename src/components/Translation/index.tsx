import React from 'react'

const Translation: React.FC<TranslationProps> = ({ trans }) => {
  return (
    <div className="pt-5 pb-4 text-lg font-sans dark:text-white dark:text-opacity-80 transition-colors duration-300 max-w-4xl">{trans}</div>
  )
}

Translation.propTypes = {}

export type TranslationProps = {
  trans: string
}

export default React.memo(Translation)
