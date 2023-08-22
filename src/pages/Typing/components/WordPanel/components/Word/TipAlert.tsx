import type { FC } from 'react'
import { useCallback } from 'react'
import IconX from '~icons/tabler/x'

export type ITipAlert = {
  className?: string
  show: boolean
  setShow: (show: boolean) => void
}

export const TipAlert: FC<ITipAlert> = ({ className, show, setShow }) => {
  const onClose = useCallback(() => {
    setShow(false)
  }, [setShow])

  return (
    <>
      {show && (
        <div className={`alert z-10 w-fit bg-indigo-300 pr-5 ${className}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current text-white" fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>

          <span>如果多次输入失败，可能是与本地浏览器插件冲突，请关闭相关插件或切换浏览器试试</span>
          <IconX className="h-5 w-5 cursor-pointer text-white " onClick={onClose} />
        </div>
      )}
    </>
  )
}
