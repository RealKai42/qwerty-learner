import React from 'react'

const Translation: React.FC<TranslationProps> = ({ trans }) => {
  return (
    <div className="pt-16 pb-5 w-96 text-2xl font-sans text-center dark:text-white dark:text-opacity-80 transition-colors duration-300">
      {trans}
    </div>
  )
}

Translation.propTypes = {}

export type TranslationProps = {
  trans: string
  transVisible: boolean
}

export default React.memo(Translation)
