export type PronunciationSwitcherPropsType = {
  state: string
  changePronunciationState: (state: string) => void
}

const PronunciationSwitcher: React.FC<PronunciationSwitcherPropsType> = ({ state, changePronunciationState }) => {
  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          className="dark:bg-gray-800 dark:text-white dark:text-opacity-60 transition-colors duration-300"
          value={state}
          onChange={(e) => {
            changePronunciationState(e.target.value)
            e.target.blur()
          }}
        >
          <option value="false">关闭</option>
          <option value="us">美音</option>
          <option value="uk">英音</option>
        </select>
      </div>
    </div>
  )
}

export default PronunciationSwitcher
