export type PronunciationSwitcherPropsType = {
  state: string
  changePronuciationState: (state: string) => void
}

const PronunciationSwitcher: React.FC<PronunciationSwitcherPropsType> = ({ state, changePronuciationState }) => {
  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          value={state}
          onChange={(e) => {
            changePronuciationState(e.target.value)
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
