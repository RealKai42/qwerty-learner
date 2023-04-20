import { RadioGroup } from '@headlessui/react'
import { useState } from 'react'

interface Props {
  titles?: string[]
}

export default function CategoryNavigation({ titles = ['中国考试', '留学考试', '代码练习'] }: Props) {
  const [selectedTitle, setSelectedTitle] = useState(titles[0])

  return (
    <div className="flex flex-col items-center justify-center pr-4 mr-4">
      <RadioGroup value={selectedTitle} onChange={setSelectedTitle} className="flex flex-col gap-y-3">
        {titles.map((title) => (
          <RadioGroup.Option
            key={title}
            value={title}
            className={({ checked }) => `flex items-center space-x-2 cursor-pointer ${checked ? 'text-gray-800' : 'text-gray-500'}`}
          >
            {({ checked }) => (
              <>
                <div className={`w-2.5 h-2.5 mr-1 rounded-full ${checked ? 'bg-indigo-400' : 'bg-indigo-100'}`} />
                <RadioGroup.Label className="text-lg ">{title}</RadioGroup.Label>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  )
}
