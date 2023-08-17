import classNames from 'classnames'
import type { FC } from 'react'
import { useCallback } from 'react'
import DownIcon from '~icons/fa/sort-down'
import UPIcon from '~icons/fa/sort-up'

type IHeadWrongNumberProps = {
  className?: string
  sortType: ISortType
  setSortType: (sortType: ISortType) => void
}

export type ISortType = 'asc' | 'desc' | 'none'

const HeadWrongNumber: FC<IHeadWrongNumberProps> = ({ className, sortType, setSortType }) => {
  const onClick = useCallback(() => {
    const sortTypes: Record<ISortType, ISortType> = {
      asc: 'desc',
      desc: 'none',
      none: 'asc',
    }
    setSortType(sortTypes[sortType])
  }, [setSortType, sortType])

  return (
    <span className={`relative cursor-pointer ${className}`} onClick={onClick}>
      错误次数
      <div className="absolute -right-2 bottom-0 top-0 flex flex-col items-center justify-center text-[12px]">
        <UPIcon
          className={classNames('-mb-2 ', {
            'text-indigo-500': sortType === 'asc',
            'text-gray-400': sortType !== 'asc',
          })}
        />
        <DownIcon
          className={classNames({
            'text-indigo-500': sortType === 'desc',
            'text-gray-400': sortType !== 'desc',
          })}
        />
      </div>
    </span>
  )
}

export default HeadWrongNumber
