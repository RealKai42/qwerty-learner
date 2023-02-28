import EnHandler from './En_handler/index'
import ZhHandler from './Zh_handler/index'
import { useAtom } from 'jotai'
import { languageAtom } from '..'
//inside Input_handler folder there could be more input handlers for other languages

export type Input_handlerProps = {
  isStart: boolean
  isFinish: boolean
  setInputWord: (value: string | ((prevValue: string) => string)) => void
  hasWrong: boolean
  playKeySound: () => void
}

const InputHandler: React.FC<Input_handlerProps> = ({ isStart, isFinish, setInputWord, playKeySound, hasWrong }) => {
  const [language] = useAtom(languageAtom)
  switch (language) {
    case 'en':
      return <EnHandler isStart={isStart} isFinish={isFinish} setInputWord={setInputWord} playKeySound={playKeySound} />
    case 'zh':
      return <ZhHandler hasWrong={hasWrong} setInputWord={setInputWord} playKeySound={playKeySound} />
    default:
      return <></>
  }
}

export default InputHandler
