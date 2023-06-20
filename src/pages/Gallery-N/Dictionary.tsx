import type { Dictionary } from '@/typings'
import * as Progress from '@radix-ui/react-progress'

interface Props {
  dictionary: Dictionary
  onClick?: () => void
}

function DictionaryComponent({ dictionary, onClick }: Props) {
  return (
    <div className="flex h-40 w-80 items-center justify-center" role="button" onClick={onClick} title="选择词典">
      <div className="h-full w-5/12 rounded-xl bg-gray-300">
        <div className="bg-gray-700"></div>
      </div>
      <div className="flex h-full w-7/12 flex-col items-start justify-start px-6 pt-2">
        <h1 className="mb-5 text-2xl font-normal">{dictionary.name}</h1>
        <p className="mb-6 text-lg text-gray-600">{dictionary.length}</p>
        <div className="mb-0 flex w-full items-center">
          <Progress.Root value={10} max={100} className="mr-4 h-3.5 w-full rounded-full border-2 border-indigo-400 bg-white">
            <Progress.Indicator
              className="h-full -translate-x-px rounded-full bg-indigo-400 pl-0"
              style={{ width: `calc(${10}% + 2px)` }}
            />
          </Progress.Root>
        </div>
      </div>
    </div>
  )
}

export default DictionaryComponent
