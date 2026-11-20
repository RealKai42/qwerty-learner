import styles from './index.module.css'
import { type PointerEvent, type ReactNode, type WheelEvent, useCallback, useEffect, useRef, useState } from 'react'

type ScrollState = {
  overflows: boolean
  canScrollDown: boolean
  thumbHeight: number
  thumbOffset: number
}

const hiddenScroll: ScrollState = {
  overflows: false,
  canScrollDown: false,
  thumbHeight: 0,
  thumbOffset: 0,
}

const TRACK_INSET = 16

export default function SettingScroll({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef({ y: 0, scrollTop: 0 })
  const [scrollState, setScrollState] = useState<ScrollState>(hiddenScroll)

  const update = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    const overflow = el.scrollHeight - el.clientHeight
    if (overflow <= 1) {
      setScrollState(hiddenScroll)
      return
    }

    const trackHeight = Math.max(el.clientHeight - TRACK_INSET, 1)
    const thumbHeight = Math.max(28, (el.clientHeight / el.scrollHeight) * trackHeight)
    const thumbTravel = Math.max(trackHeight - thumbHeight, 1)
    setScrollState({
      overflows: true,
      canScrollDown: overflow - el.scrollTop > 8,
      thumbHeight,
      thumbOffset: (el.scrollTop / overflow) * thumbTravel,
    })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [update])

  const onTrackWheel = (event: WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop += event.deltaY
  }

  const onThumbPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!el) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragOrigin.current = { y: event.clientY, scrollTop: el.scrollTop }
  }

  const onThumbPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!el || !event.currentTarget.hasPointerCapture(event.pointerId)) return

    const overflow = el.scrollHeight - el.clientHeight
    const trackHeight = Math.max(el.clientHeight - TRACK_INSET, 1)
    const thumbHeight = Math.max(28, (el.clientHeight / el.scrollHeight) * trackHeight)
    const thumbTravel = Math.max(trackHeight - thumbHeight, 1)
    const delta = event.clientY - dragOrigin.current.y
    el.scrollTop = dragOrigin.current.scrollTop + (delta / thumbTravel) * overflow
  }

  return (
    <div className={styles.settingScrollFrame}>
      <div ref={scrollerRef} className={`${styles.settingScroll} select-none`} onScroll={update}>
        {children}
      </div>
      {scrollState.overflows && (
        <div className={styles.settingScrollTrack} aria-hidden="true" onWheel={onTrackWheel}>
          <div
            className={styles.settingScrollThumb}
            style={{ height: scrollState.thumbHeight, transform: `translateY(${scrollState.thumbOffset}px)` }}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
          />
        </div>
      )}
      {scrollState.canScrollDown && <div className={styles.settingScrollHint} aria-hidden="true" />}
    </div>
  )
}
