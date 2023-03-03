import React from 'react'

export type PhoneticProps = {
  usphone: string
  ukphone: string
  japphone: string
}

const Phonetic: React.FC<PhoneticProps> = ({ usphone, ukphone, japphone }) => {
  return (
    <div className="space-x-5 pt-1 text-center text-sm font-normal text-gray-600 transition-colors duration-300 dark:text-gray-400">
      {usphone && usphone.length > 1 && <span>{`US: [${usphone}]`}</span>}
      {ukphone && ukphone.length > 1 && <span>{`UK: [${ukphone}]`}</span>}
      {japphone && japphone.length > 1 && <span>{`${japphone}`}</span>}
    </div>
  )
}

export default React.memo(Phonetic)
