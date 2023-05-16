import { TypingContext, TypingStateActionType } from '../../store'
import { useContext } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import IconRepeatOff from '~icons/tabler/repeat-off'
import IconRepeatOnce from '~icons/tabler/repeat-once'

const LoopWordSwitcher = () => {
  const { state, dispatch } = useContext(TypingContext) ?? {}
  const changeLoopSingleWordState = () => {
    if (dispatch) {
      dispatch({ type: TypingStateActionType.TOGGLE_IS_LOOP_SINGLE_WORD })
    }
  }
  useHotkeys(
    'ctrl+l',
    () => {
      changeLoopSingleWordState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
  return (
    <button
      className={`p-[2px] ${state?.isLoopSingleWord ? 'text-indigo-500' : 'text-gray-500'} text-lg focus:outline-none`}
      type="button"
      onClick={(e) => {
        changeLoopSingleWordState()
        e.currentTarget.blur()
      }}
      aria-label="开关单个单词循环（Ctrl + L）"
    >
      {state?.isLoopSingleWord ? <IconRepeatOnce /> : <IconRepeatOff />}
    </button>
  )
}

export default LoopWordSwitcher
