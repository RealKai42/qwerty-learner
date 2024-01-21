import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { FC } from 'react'
import { useCallback } from 'react'
import PhWarning from '~icons/ph/warning'

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
        <div className={`alert z-10 w-fit cursor-pointer pr-5 ${className}`} onClick={onClose}>
          <Alert variant="destructive" className="relative">
            <PhWarning className="h-4 w-4" />
            <AlertTitle>插件冲突！</AlertTitle>
            <AlertDescription>如果多次输入失败，可能是与本地浏览器插件冲突，请关闭相关插件或切换浏览器试试</AlertDescription>
          </Alert>
        </div>
      )}
    </>
  )
}
