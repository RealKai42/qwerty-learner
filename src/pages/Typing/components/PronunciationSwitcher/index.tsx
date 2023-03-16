import { PronunciationType } from '@/typings/index'
import { LANG_PRON_MAP } from '@/resources/soundResource'
import { useAtomValue, useAtom } from 'jotai'
import { currentDictInfoAtom, pronunciationConfigAtom } from '@/store'
import { useCallback, useEffect } from 'react'

const PronunciationSwitcher = () => {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const pronunciationList = LANG_PRON_MAP[currentDictInfo.language].pronunciation

  useEffect(() => {
    const pronIndex = currentDictInfo.defaultPronIndex || LANG_PRON_MAP[currentDictInfo.language].defaultPronIndex
    setPronunciationConfig((old) => ({
      ...old,
      type: LANG_PRON_MAP[currentDictInfo.language].pronunciation[pronIndex].pron,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDictInfo.language])

  const setPron = useCallback((newState: PronunciationType | boolean) => {
    if (typeof newState === 'boolean') {
      setPronunciationConfig((old) => ({
        ...old,
        isOpen: newState,
      }))
    } else {
      setPronunciationConfig((old) => ({
        ...old,
        isOpen: true,
        type: newState,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex items-center justify-center space-x-3">
      <div>
        <select
          className="cursor-pointer transition-colors duration-300 focus:outline-none dark:bg-gray-800 dark:text-white dark:text-opacity-60"
          value={pronunciationConfig.isOpen ? pronunciationConfig.type : 'false'}
          onChange={(e) => {
            const newState = e.target.value === 'false' ? false : (e.target.value as PronunciationType)
            setPron(newState)
            e.target.blur()
          }}
        >
          <option value="false">关闭</option>
          {pronunciationList.map((pron, index) => (
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
