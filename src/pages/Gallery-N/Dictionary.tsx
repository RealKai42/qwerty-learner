import * as Progress from '@radix-ui/react-progress'

interface Props {
  title?: string
  description?: string
  progress?: number
}

function Dictionary({ title = '四年级上', description = '64词', progress = 45 }: Props) {
  return (
    <div className="flex items-center justify-center w-80 h-40">
      <div className="w-5/12 h-full bg-gray-300 rounded-xl">
        <div className="bg-gray-700"></div>
      </div>
      <div className="w-7/12 px-6 flex flex-col items-start justify-start h-full pt-2">
        <h1 className="text-2xl font-normal mb-5">{title}</h1>
        <p className="text-lg text-gray-600 mb-6">{description}</p>
        <div className="flex items-center mb-0 w-full">
          <Progress.Root value={progress} max={100} className="h-3.5 w-full rounded-full bg-white mr-4 border-2 border-indigo-400">
            <Progress.Indicator
              className="-translate-x-px h-full pl-0 rounded-full bg-indigo-400"
              style={{ width: `calc(${progress}% + 2px)` }}
            />
          </Progress.Root>
        </div>
      </div>
    </div>
  )
}

export default Dictionary
