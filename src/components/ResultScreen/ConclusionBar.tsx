import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ConclusionBar = ({ mistakeLevel, mistakeCount }: ConclusionBarProps) => {
  let content
  switch (mistakeLevel) {
    case 0:
      content = (
        <>
          <FontAwesomeIcon icon={['fas', 'heart']} className="text-indigo-600" size="lg" />
          <span className="text-base font-medium text-gray-700 ml-2 leading-10 inline-block align-middle">
            表现不错！只错了 {mistakeCount} 个单词
          </span>
        </>
      )
      break
    case 1:
      content = (
        <>
          <FontAwesomeIcon icon={['fas', 'thumbs-up']} className="text-indigo-600 leading-10" size="lg" />
          <div className="text-base font-medium text-gray-700 ml-2 leading-10 inline-block align-middle">
            有些小问题哦，下一次可以做得更好！
          </div>
        </>
      )
      break
    case 2:
      content = (
        <>
          <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="text-indigo-600" size="lg" />
          <div className="text-base font-medium text-gray-700 ml-2 leading-10 inline-block align-middle">错误太多，再来一次如何？</div>
        </>
      )
      break
  }
  return <div className="h-10 flex flex-row items-center">{content}</div>
}

export type ConclusionBarProps = {
  mistakeLevel: number
  mistakeCount: number
}

export default ConclusionBar
