import { clamp } from 'lodash'
import { useMemo } from 'react'
import classNames from 'classnames'

export type RemarkRingProps = {
  remark: string
  caption: string
  /**
   * `null` if the percentage is not appliable.
   * Otherwise, this is an integer between 0 and 100.
   */
  percentage?: number | null
  /**
   * Default to 7 rem.
   */
  size?: number
}

const rootFontSize = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'))

export default function RemarkRing({ remark, caption, percentage = null, size = 7 }: RemarkRingProps) {
  const clipPath = useMemo(() => {
    if (percentage === null) {
      return null
    }
    const clamped = clamp(percentage, 0, 100)
    const alpha = Math.PI * 2 * (clamped / 100)
    const r = (rootFontSize * size) / 2
    return `M ${r},0 A ${r},${r} 0 ${clamped > 50 ? 1 : 0},1 ${r + Math.sin(alpha) * r},${r + -Math.cos(alpha) * r} L ${r},${r} Z`
  }, [percentage, size])
  return (
    <div
      className={classNames(
        'flex-shrink-0 relative flex flex-col items-center justify-center rounded-full border-8 border-indigo-200 dark:border-gray-700 bg-transparent',
      )}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
      }}
    >
      {percentage !== null && (
        <div
          className="absolute -inset-2 rounded-full border-8 border-indigo-400 dark:border-indigo-500 bg-transparent"
          style={{
            clipPath: `path("${clipPath}")`,
          }}
          aria-hidden
        />
      )}
      <span className="text-xl text-gray-800 dark:text-gray-300 tabular-nums">{remark}</span>
      <span className="text-sm text-gray-600 dark:text-gray-500 font-medium">{caption}</span>
    </div>
  )
}
