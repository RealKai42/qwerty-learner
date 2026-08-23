import { TypingGameContext } from '../index'
import type { TypingGameConfig } from '@/@types/game'
import logo from '@/assets/logo.svg'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEVELS, LIFERANGE } from '@/constants/index'
import { currentDictInfoAtom, isOpenDarkModeAtom, typingGameConfigAtom } from '@/store'
import { useAtom, useAtomValue } from 'jotai'
import { memo, useCallback, useContext, useEffect, useMemo } from 'react'
import type React from 'react'
import { NavLink } from 'react-router-dom'
import IconMoon from '~icons/heroicons/moon-solid'
import IconSun from '~icons/heroicons/sun-solid'

const selectTriggerHoverStyle = 'hover:text-white hover:bg-indigo-500 dark:hover:text-indigo-500 dark:hover:bg-slate-700'
const selectTriggerStyle = `min-w-[4.2rem] border-none bg-transparent dark:bg-transparent focus:ring-transparent focus:ring-offset-0 dark:focus:ring-transparent dark:focus:ring-offset-0 text-lg text-indigo-500 ${selectTriggerHoverStyle}`
const selectContentStyle = 'my-card min-w-[4.2rem] dark:bg-gray-800 rounded-xl'
const selectItemStyle =
  'dark:focus:bg-slate-700 text-lg text-indigo-500 focus:text-indigo-500 dark:focus:text-indigo-500 last:hover:rounded-b-xl'

const SettingBar: React.FC = () => {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [gameConfig, setGameConfig] = useAtom(typingGameConfigAtom)
  const { state, setState } = useContext(TypingGameContext)
  const buttonState = useMemo(() => {
    switch (state) {
      case 'init':
        return '开始'
      case 'running':
        return '暂停'
      case 'win':
        return '再来一局'
      case 'gameover':
        return '重新挑战'
      case 'paused':
        return '继续'
      default:
        return '开始'
    }
  }, [state])
  const handleButtonStateChange = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    switch (state) {
      case 'init':
        setState('running')
        break
      case 'running':
        setState('paused')
        break
      case 'win':
      case 'gameover':
        setState('init')
        break
      case 'paused':
        setState('running')
        break
      default:
        setState('init')
    }
    e.currentTarget.blur()
  }

  const handleGameConfigChange = (newConfig: Partial<TypingGameConfig>) => {
    setGameConfig((oldConfig) => ({
      ...oldConfig,
      ...newConfig,
      lifeLeft: newConfig.life !== undefined ? newConfig.life : oldConfig.lifeLeft,
    }))
  }

  const initGameConfig = useCallback(() => {
    setGameConfig((oldConfig) => ({
      ...oldConfig,
      lifeLeft: oldConfig.life,
    }))
  }, [setGameConfig])

  useEffect(initGameConfig, [initGameConfig])

  const [isOpenDarkMode, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const changeDarkModeState = () => {
    setIsOpenDarkMode((old) => !old)
  }

  return (
    <div className="my-card flex items-center gap-3 rounded-xl bg-white transition-colors duration-300 dark:bg-gray-800 ">
      <NavLink className={`flex h-10 justify-items-center rounded-lg text-indigo-500 ${selectTriggerHoverStyle}`} to="/">
        <img src={logo} className="mx-3 h-10 w-6 max-w-none " alt="Qwerty Learner Logo" />
      </NavLink>
      <NavLink className={`flex h-10 justify-items-center rounded-lg text-indigo-500 ${selectTriggerHoverStyle}`} to="/gallery">
        <button
          className={`h-10 min-w-[4.2rem] justify-items-center rounded-lg text-lg text-indigo-500 focus:outline-none ${selectTriggerHoverStyle}`}
          type="button"
        >
          {currentDictInfo.name}
        </button>
      </NavLink>

      <Selector value={gameConfig.level} setValue={handleGameConfigChange} options={LEVELS} name={{ alias: '难度', value: 'level' }} />
      <Selector value={gameConfig.lifeLeft} setValue={handleGameConfigChange} options={LIFERANGE} name={{ alias: '生命', value: 'life' }} />

      <button
        className={`h-10 justify-items-center rounded-lg text-lg text-indigo-500 focus:outline-none ${selectTriggerHoverStyle}`}
        type="button"
        onClick={(e) => {
          changeDarkModeState()
          e.currentTarget.blur()
        }}
        aria-label="开关深色模式"
      >
        {isOpenDarkMode ? <IconMoon className="icon mx-3 " /> : <IconSun className="icon mx-3 " />}
      </button>

      <button
        className={`h-10 min-w-[4.2rem] flex-none justify-items-center rounded-lg text-lg text-indigo-500 focus:outline-none ${selectTriggerHoverStyle}`}
        type="button"
        aria-label="开始"
        onClick={handleButtonStateChange}
      >
        {buttonState}
      </button>
      <button
        className={`h-10 min-w-[4.2rem] justify-items-center rounded-lg text-lg text-indigo-500 focus:outline-none ${selectTriggerHoverStyle}`}
        type="button"
        aria-label="重置"
        onClick={() => {
          setState('init')
        }}
      >
        重置
      </button>
    </div>
  )
}

type SelectorArgs = {
  value: string
  setValue: (newConfig: Partial<TypingGameConfig>) => void
  options: string[]
  name: { alias: string; value: keyof TypingGameConfig }
}

const Selector = memo(function Selector({ value, setValue, options, name }: SelectorArgs) {
  return (
    <Select
      key={name.alias}
      value={value}
      onValueChange={(v) => {
        setValue({ [name.value]: v })
      }}
    >
      <SelectTrigger className={selectTriggerStyle}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={selectContentStyle}>
        <SelectGroup>
          <SelectLabel className="text-lg text-indigo-500">{name.alias}</SelectLabel>
          {options.map((item) => (
            <SelectItem className={selectItemStyle} key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
})

export default SettingBar
