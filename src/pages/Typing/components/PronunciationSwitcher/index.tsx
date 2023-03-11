import { PronunciationType } from '@/typings/index'
import { LANG_PRON_MAP } from '@/resources/soundResource'
import { useAtomValue, useAtom } from 'jotai'
import { currentDictInfoAtom, pronunciationConfigAtom } from '@/store'

const PronunciationSwitcher = () => {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const pronunciationList = LANG_PRON_MAP[currentDictInfo.language].pronunciation

  // todo: 自动设置默认的 pron，可能不应该在这个 component 里面设置
  // const { language, defaultPronIndex } = languageConfig
  // useEffect(() => {
  //   // 如果 defaultPron 是 undefined LANG_PRON_MAP[language].defaultPron.pron 作为默认参数
  //   const pronIndex = defaultPronIndex || LANG_PRON_MAP[language].defaultPronIndex
  //   changePronunciationState(LANG_PRON_MAP[language].pronunciation[pronIndex].pron)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [language])

  const setPron = (newState: PronunciationType | boolean) => {
    console.log(newState)
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
  }

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
