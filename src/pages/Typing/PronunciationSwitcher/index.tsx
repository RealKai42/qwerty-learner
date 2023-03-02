import { Lang_Pron_Map } from '@/utils/utils'
import React, { useEffect } from 'react'

export type PronunciationSwitcherPropsType = {
  state: string
  language: string
  changePronunciationState: (state: string) => void
}

const PronunciationSwitcher: React.FC<PronunciationSwitcherPropsType> = ({ state, language, changePronunciationState }) => {
  const pronListData = Lang_Pron_Map.find((item) => item.language === language)
  const pronList = pronListData?.pronunciation || []
  const pronNameList = pronListData?.pronName || []

  useEffect(() => {
    changePronunciationState(pronList[0])
  }, [language])

  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          className="cursor-pointer transition-colors duration-300 focus:outline-none dark:bg-gray-800 dark:text-white dark:text-opacity-60"
          value={state}
          onChange={(e) => {
            changePronunciationState(e.target.value)
            e.target.blur()
          }}
        >
          <option value="false">关闭</option>
          {pronList.map((pron, index) => (
            <option key={pron} value={pron}>
              {pronNameList[index]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default PronunciationSwitcher
