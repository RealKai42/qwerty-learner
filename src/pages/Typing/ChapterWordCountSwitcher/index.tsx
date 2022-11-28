export type ChapterWordCountSwitcherPropsType = {
  state: number
  changeChapterWordCountState: (state: number) => void
}

const ChapterWordCountSwitcher: React.FC<ChapterWordCountSwitcherPropsType> = ({ state, changeChapterWordCountState }) => {
  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          className="dark:bg-gray-800 dark:text-white dark:text-opacity-60 transition-colors duration-300"
          value={state}
          onChange={(e) => {
            changeChapterWordCountState(Number(e.target.value))
            e.target.blur()
          }}
        >
          <option value="20">20</option>
          <option value="40">40</option>
          <option value="60">60</option>
          <option value="80">80</option>
        </select>
      </div>
    </div>
  )
}

export default ChapterWordCountSwitcher
