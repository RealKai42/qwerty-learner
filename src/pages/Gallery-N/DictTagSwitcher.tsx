import { RadioGroup } from '@headlessui/react'
import { useState } from 'react'

const options = [
  { id: 1, name: '人教版' },
  { id: 2, name: '新概念' },
  { id: 3, name: '外研版' },
]

export default function DictTagSwitcher() {
  const [selectedOption, setSelectedOption] = useState(options[0].id)

  return (
    <RadioGroup value={selectedOption} onChange={(value) => setSelectedOption(value)}>
      <div className="flex items-center space-x-4">
        {options.map((option) => (
          <RadioGroup.Option
            key={option.id}
            value={option.id}
            className={({ active }) =>
              `px-4 py-2 rounded-[3rem] cursor-pointer ${active ? 'bg-indigo-400 text-white' : 'bg-white text-gray-600'}`
            }
          >
            <p className={`font-normal `}>{option.name}</p>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
