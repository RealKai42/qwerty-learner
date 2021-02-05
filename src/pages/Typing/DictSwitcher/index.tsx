import { dictList } from '../hooks/useWordList'
import _ from 'lodash'

export type DictSwitcherPropsType = {
  dictName: string
  chapter: number
  chapterListLength: number
  changeDict: any
  changeChapter: any
}

const DictSwitcher: React.FC<DictSwitcherPropsType> = ({ dictName, chapter, chapterListLength, changeDict, changeChapter }) => {
  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          value={dictName}
          onChange={(e) => {
            changeDict(e.target.value)
            e.target.blur()
          }}
        >
          {Object.keys(dictList).map((key) => (
            <option value={key} key={key}>
              {dictList[key][0]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={chapter}
          onChange={(e) => {
            changeChapter(parseInt(e.target.value))
            e.target.blur()
          }}
        >
          {_.range(chapterListLength).map((i) => {
            return (
              <option value={i} key={i}>
                Chap. {i + 1}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}

export default DictSwitcher
