import { LoadingUI } from '@/components/Loading'
import type { FC } from 'react'
import ErrorIcon from '~icons/ic/outline-error'

type LoadingWordUIProps = {
  className?: string
  isLoading: boolean
  hasError: boolean
}

export const LoadingWordUI: FC<LoadingWordUIProps> = ({ className, isLoading, hasError }) => {
  return (
    <div className={`${className}`}>
      {hasError ? (
        <div className="tooltip !bg-transparent" data-tip="数据加载失败">
          <ErrorIcon className="text-red-500" />
        </div>
      ) : (
        isLoading && <LoadingUI />
      )}
    </div>
  )
}
