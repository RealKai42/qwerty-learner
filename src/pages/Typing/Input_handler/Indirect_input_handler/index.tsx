import { useEffect, useRef, useState } from 'react'

export type IIHProps = {
  setInputWord: (value: string | ((prevValue: string) => string)) => void
  playKeySound: () => void
}

//const Indirect_input_handler = () => {
const Indirect_input_handler: React.FC<IIHProps> = ({ setInputWord, playKeySound }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  //const [inputValueUnprocessed, setInputValue] = useState('')
  const [unprocessedInput, setUnprocessedInput] = useState('')
  const [processedInput, setProcessedInput] = useState('')

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnprocessedInput(e.target.value)
  }

  //process input
  useEffect(() => {
    //regexp to save only chinese characters
    const regexp = /[\u4e00-\u9fa5]/g
    //extract chinese characters
    const extracted = unprocessedInput.match(regexp)?.join('') || ''
    //add to bottom of processedInput
    setProcessedInput((prev) => prev + extracted)
    //clear unprocessedInput
    setUnprocessedInput('')
    //reget focus on input again
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [unprocessedInput])

  useEffect(() => {
    if (processedInput.length > 0) {
      setInputWord(processedInput)
      playKeySound() //keysound will be played no matter the input is correct or not originally, so here we play it without checking
    }
  }, [processedInput])

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
    <input
      ref={inputRef}
      className=""
      style={{ opacity: 0, height: 0, width: 0, transform: 'translateY(4em)' }}
      tabIndex={-1}
      value={unprocessedInput}
      onChange={handleOnchange}
    />
  )
}

export default Indirect_input_handler
