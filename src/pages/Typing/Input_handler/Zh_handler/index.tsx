import { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { inputCountAtom } from '../..'

export type IIHProps = {
  hasWrong: boolean
  setInputWord: (value: string | ((prevValue: string) => string)) => void
  //setInputCount: Function
  playKeySound: () => void
}

const Indirect_input_handler: React.FC<IIHProps> = ({
  hasWrong,
  setInputWord,
  //setInputCount,
  playKeySound,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [unprocessedInput, setUnprocessedInput] = useState('')
  const [processedInput, setProcessedInput] = useState('')
  const [, setInputCount] = useAtom(inputCountAtom)

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnprocessedInput(e.target.value)
    setInputCount((prev: number) => prev + e.target.value.length)
  }

  useEffect(() => {
    if (hasWrong) {
      setProcessedInput('')
    }
  }, [hasWrong])

  useEffect(() => {
    const regexp = /[\u4e00-\u9fa5a-zA-Z0-9\s，。?]/g
    const extracted = unprocessedInput.match(regexp)?.join('') || ''
    setProcessedInput((prev) => prev + extracted)
    setUnprocessedInput('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unprocessedInput])

  useEffect(() => {
    if (processedInput.length > 0) {
      setInputWord(processedInput)
      playKeySound() //keysound will be played no matter the input is correct or not originally, so here we play it without checking
    }
  }, [processedInput, playKeySound, setInputWord])

  useEffect(() => {
    const handleKeyDown = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <input
        ref={inputRef}
        className=""
        style={{
          opacity: 0,
          height: 0,
          width: 0,
          transform: 'translateY(4em)',
        }}
        tabIndex={-1}
        value={unprocessedInput}
        onChange={handleOnchange}
      />
    </>
  )
}

export default Indirect_input_handler
