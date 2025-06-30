import { recordAnalysisAction } from '@/utils'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import GameIcon from '~icons/material-symbols/stadia-controller'

const TypingGameButton = () => {
  const navigate = useNavigate()

  const toTypingGame = useCallback(() => {
    navigate('/typing-game')
    recordAnalysisAction('open')
  }, [navigate])

  return (
    <button
      type="button"
      onClick={toTypingGame}
      className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white`}
      title="开始打字游戏"
    >
      <GameIcon className="icon" />
    </button>
  )
}

export default TypingGameButton
