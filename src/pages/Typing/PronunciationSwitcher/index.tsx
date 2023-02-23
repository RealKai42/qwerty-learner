export type PronunciationSwitcherPropsType = {
  state: string
  changePronunciationState: (state: string) => void
}

const PronunciationSwitcher: React.FC<PronunciationSwitcherPropsType> = ({ state, changePronunciationState }) => {
  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          className="dark:bg-gray-800 dark:text-white dark:text-opacity-60 transition-colors duration-300 cursor-pointer focus:outline-none"
          value={state}
          onChange={(e) => {
            changePronunciationState(e.target.value)
            e.target.blur()
          }}
        >
          <option value="false">关闭</option>
          <option value="us">美音</option>
          <option value="uk">英音</option>
          <option value="romaji">罗马音</option>
          <option value="zh">中文</option>
          <option value="jp">日语</option>
          <option value="ko">韩语</option>
        </select>
      </div>
    </div>
  )
}

export default PronunciationSwitcher
