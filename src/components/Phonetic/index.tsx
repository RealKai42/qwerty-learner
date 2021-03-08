import React from 'react'

export type PhoneticProps = {
  usphone: string
  ukphone: string
}

const Phonetic: React.FC<PhoneticProps> = ({ usphone, ukphone }) => {
  return (
    <div className="pt-1 text-sm font-normal text-gray-600 dark:text-gray-400 transition-colors duration-300 text-center space-x-5">
      {usphone.length > 1 && <span>{`US: [${usphone}]`}</span>}
      {ukphone.length > 1 && <span>{`UK: [${ukphone}]`}</span>}
    </div>
  )
}

export default React.memo(Phonetic)
