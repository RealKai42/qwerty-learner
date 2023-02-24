import { useEffect, useRef, useState } from 'react'

export type IIHProps = {
  language: string
  hasWrong: boolean
  setInputWord: (value: string | ((prevValue: string) => string)) => void
  playKeySound: () => void
}

//multiple regexp expressions for different target languages
//for zh, jp, ko
//a function, give a language, return a regexp
const getRegexp = (language: string) => {
  switch (language) {
    case 'zh':
      return /[\u4e00-\u9fa5]/g
    case 'jp':
      return /[\u3040-\u309f\u30a0-\u30ff\uff66-\uff9f]/g
    case 'ko':
      return /[\uac00-\ud7a3]/g
    default:
      //for english
      return /[a-zA-Z]/g
  }
}

const Indirect_input_handler: React.FC<IIHProps> = ({ language, hasWrong, setInputWord, playKeySound }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [unprocessedInput, setUnprocessedInput] = useState('')
  const [processedInput, setProcessedInput] = useState('')

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnprocessedInput(e.target.value)
  }

  useEffect(() => {
    if (hasWrong) {
      setProcessedInput('')
    }
  }, [hasWrong])

  //process input
  useEffect(() => {
    //regexp to save only chinese characters
    //dynamicly get regexp using getRegexp function
    const regexp = getRegexp(language)
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
