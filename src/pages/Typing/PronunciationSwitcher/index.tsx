import { LanguageType, PronunciationType } from '@/store/AppState'
import { LANG_PRON_MAP } from '@/utils/utils'
import React, { useEffect } from 'react'

export type PronunciationSwitcherPropsType = {
  state: PronunciationType
  languageConfig: {
    language: LanguageType
    defaultPronIndex?: number // defaultPron 可以是 undefined
  }
  changePronunciationState: (state: PronunciationType) => void
}

const PronunciationSwitcher: React.FC<PronunciationSwitcherPropsType> = ({ state, languageConfig, changePronunciationState }) => {
  const { language, defaultPronIndex } = languageConfig
  useEffect(() => {
    // 如果 defaultPron 是 undefined LANG_PRON_MAP[language].defaultPron.pron 作为默认参数
    let pronIndex = defaultPronIndex || LANG_PRON_MAP[language].defaultPronIndex
    changePronunciationState(LANG_PRON_MAP[language].pronunciation[pronIndex].pron)
  }, [language])

  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          className="cursor-pointer transition-colors duration-300 focus:outline-none dark:bg-gray-800 dark:text-white dark:text-opacity-60"
          value={state.toString()}
          onChange={(e) => {
            const newState = e.target.value === 'false' ? false : e.target.value
            changePronunciationState(newState as PronunciationType)
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
