import React from 'react'

const InfoBox: React.FC<InfoBoxProps> = ({ info, description }) => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center">
      <span className="font-bold w-4/5 text-center text-xl text-gray-600 pb-2" style={{ borderBottomWidth: '1px' }}>
        {info}
      </span>
      <span className="text-xs pt-2">{description}</span>
    </div>
  )
}

export default React.memo(InfoBox)

export type InfoBoxProps = {
  info: string
  description: string
}
