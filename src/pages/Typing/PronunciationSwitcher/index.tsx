import { LanguageType } from '@/store/AppState'
import { LANG_PRON_MAP } from '@/utils/utils'
import React, { useEffect } from 'react'

export type PronunciationSwitcherPropsType = {
  state: string
  language: LanguageType
  defaultPron: string | null // defaultPron 可以是 null
  changePronunciationState: (state: string) => void
}

const PronunciationSwitcher: React.FC<PronunciationSwitcherPropsType> = ({ state, language, defaultPron, changePronunciationState }) => {
  useEffect(() => {
    // 如果 defaultPron 是 null，使用 LANG_PRON_MAP[language].defaultPron.pron 作为默认参数
    //const defaultPronunciation = defaultPron === null ? LANG_PRON_MAP[language].defaultPron.pron : defaultPron
    let defaultPronunciation
    if (defaultPron === '') {
      defaultPronunciation = LANG_PRON_MAP[language].defaultPron.pron
    } else {
      defaultPronunciation = defaultPron
    }
    changePronunciationState(defaultPronunciation as string)
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
          {LANG_PRON_MAP[language].pronunciation.map((pron, index) => (
            <option key={index} value={pron.pron}>
              {pron.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default PronunciationSwitcher
