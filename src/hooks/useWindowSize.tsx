import { useEffect, useState } from 'react'

const isClient = typeof window === 'object'

const useWindowSize = (initialWidth = Infinity, initialHeight = Infinity) => {
  const [state, setState] = useState<{ width: number; height: number }>({
    width: isClient ? window.innerWidth : initialWidth,
    height: isClient ? window.innerHeight : initialHeight,
  })

  useEffect(() => {
    if (isClient) {
      let timer: ReturnType<typeof setTimeout>
      const handler = () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          setState({
            width: window.innerWidth,
            height: window.innerHeight,
          })
        }, 150)
      }
      window.addEventListener('resize', handler)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', handler)
      }
    } else {
      return undefined
    }
  }, [])

  return state
}

export default useWindowSize
