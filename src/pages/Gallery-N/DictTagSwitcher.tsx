import { RadioGroup } from '@headlessui/react'
import { useCallback } from 'react'

type Props = {
  tagList: string[]
  currentTag: string
  onChangeCurrentTag: (tag: string) => void
}

export default function DictTagSwitcher({ tagList, currentTag, onChangeCurrentTag }: Props) {
  const onChangeTag = useCallback(
    (tag: string) => {
      onChangeCurrentTag(tag)
    },
    [onChangeCurrentTag],
  )

  return (
    <RadioGroup value={currentTag} onChange={onChangeTag} className="w-full min-w-0">
      {/* 标签是筛选器，数量多时（如 Code 分类有 13 个）换行展开，
          不用横向滚动——滚动会把可选项藏起来。 */}
      <div className="flex flex-wrap items-center gap-3">
        {tagList.map((option) => (
          <RadioGroup.Option
            key={option}
            value={option}
            className={({ checked }) =>
              `cursor-pointer whitespace-nowrap rounded-[3rem] px-4 py-2 ${
                checked ? 'bg-indigo-400 text-white' : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-200'
              } ${!checked && 'hover:bg-indigo-100 dark:hover:bg-gray-600'}`
            }
          >
            <p className={`font-normal `}>{option}</p>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
