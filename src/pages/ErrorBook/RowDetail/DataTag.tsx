import type React from 'react'

interface DataTagProps {
  icon: React.ElementType
  name: string
  data: number | string
}

const DataTag: React.FC<DataTagProps> = ({ icon, name, data }) => {
  const IconComponent = icon

  return (
    <div className="g flex h-10 w-40 flex-1 select-none items-center justify-between rounded-md border-gray-400 bg-gray-100 px-3 py-5 shadow">
      <div className="flex items-center space-x-1 ">
        <IconComponent className="h-4 w-4 text-gray-700" />
        <span className="break-keep text-base font-normal text-gray-500">{name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-base font-normal text-gray-800">{data}</span>
      </div>
    </div>
  )
}

export default DataTag
