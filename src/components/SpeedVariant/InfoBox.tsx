import React from 'react'

const InfoBox: React.FC<InfoBoxProps> = ({ info, description }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-white">
      <span className="font-bold w-4/5 text-center text-3xl transition-colors duration-300 pb-2 border-b-4 font-mono">{info}</span>
      <span className="text-2xl pt-2 transition-colors duration-300">{description}</span>
    </div>
  )
}

export default React.memo(InfoBox)

export type InfoBoxProps = {
  info: string
  description: string
}
