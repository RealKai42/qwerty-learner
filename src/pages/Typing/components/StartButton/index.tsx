import { TypingContext, TypingStateActionType } from '../../store'
import Tooltip from '@/components/Tooltip'
import { randomConfigAtom } from '@/store'
import { autoUpdate, offset, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export default function StartButton({ isLoading }: { isLoading: boolean }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const randomConfig = useAtomValue(randomConfigAtom)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    state.isTyping && inputRef.current?.focus()
  }, [state.isTyping])
  const onToggleIsTyping = () => {
    !isLoading && dispatch({ type: TypingStateActionType.TOGGLE_IS_TYPING })
  }

  const onClickRestart = useCallback(() => {
    dispatch({ type: TypingStateActionType.REPEAT_CHAPTER, shouldShuffle: randomConfig.isOpen })
  }, [dispatch, randomConfig.isOpen])

  useHotkeys('enter', onToggleIsTyping, { enableOnFormTags: true, preventDefault: true }, [onToggleIsTyping])

  const [isShowReStartButton, setIsShowReStartButton] = useState(false)
  const { refs, context } = useFloating({
    open: isShowReStartButton,
    onOpenChange: setIsShowReStartButton,
    whileElementsMounted: autoUpdate,
    middleware: [offset(5)],
  })
  const hoverButton = useHover(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hoverButton])

  return (
    <div>
      <input type="text" ref={inputRef} className="absolute -top-[999px] left-0" />

      <Tooltip content={`${state.isTyping ? '暂停' : '开始'} （Enter）`} className="box-content h-7 w-8 px-6 py-1">
        <div
          ref={refs.setReference}
          {...getReferenceProps()}
          className={`${
            state.isTyping
              ? 'bg-gray-400 shadow-gray-200 dark:bg-gray-600  dark:shadow-none'
              : 'bg-indigo-500 shadow-indigo-300 dark:shadow-indigo-500/60'
          } ${
            isShowReStartButton ? 'h-20' : 'h-auto'
          } flex-column absolute left-0 top-0 w-20 rounded-lg shadow-lg transition-colors duration-200`}
        >
          <button
            className={`${
              state.isTyping ? 'bg-gray-400  dark:bg-gray-700 dark:hover:bg-gray-500' : 'bg-indigo-500'
            } my-btn-primary w-20 shadow`}
            type="button"
            onClick={onToggleIsTyping}
            aria-label={state.isTyping ? 'pause' : 'start'}
          >
            <span className="break-keep font-medium">{state.isTyping ? '暂停' : '开始'}</span>
          </button>

          {isShowReStartButton && (
            <div className="absolute bottom-0 flex w-20 justify-center" ref={refs.setFloating} {...getFloatingProps()}>
              <button
                className={`${
                  state.isTyping ? 'bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-500 ' : 'bg-indigo-400 '
                } my-btn-primary mb-1 mt-1 w-18 break-keep  transition-colors duration-200`}
                type="button"
                onClick={onClickRestart}
                aria-label="restart"
              >
                重新开始
              </button>
            </div>
          )}
        </div>
      </Tooltip>
    </div>
  )
}
