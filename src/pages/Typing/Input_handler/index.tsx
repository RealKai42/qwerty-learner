import EnHandler from './En_handler/index'
import ZhHandler from './Zh_handler/index'
//inside Input_handler folder there could be more input handlers for other languages

export type Input_handlerProps = {
  language: string
  isStart: boolean
  isFinish: boolean
  setInputWord: (value: string | ((prevValue: string) => string)) => void
  hasWrong: boolean
  playKeySound: () => void
  //place needed props for all input handlers here
}

const InputHandler: React.FC<Input_handlerProps> = ({ language, isStart, isFinish, setInputWord, playKeySound, hasWrong }) => {
  //render En_handler or IIH based on language, using switch
  switch (language) {
    case 'en':
      return <EnHandler isStart={isStart} isFinish={isFinish} setInputWord={setInputWord} playKeySound={playKeySound} />
    case 'zh':
      return <ZhHandler language={language} hasWrong={hasWrong} setInputWord={setInputWord} playKeySound={playKeySound} />
    /* more cases */
    default:
      return <></>
  }
}

export default InputHandler
