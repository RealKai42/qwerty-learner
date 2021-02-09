import { useState, MouseEvent } from 'react'

export const useModals = (initialState: boolean, initialTitle: string) => {
  const [modalState, setModalState] = useState<boolean>(initialState)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState('')
  const [firstButton, setFirstButton] = useState('')
  const [secondButton, setSecondButton] = useState('')
  const [thirdButton, setThirdButton] = useState('')
  const [firstButtonOnclick, setFirstButtonOnclick] = useState<(e: MouseEvent) => void>(() => {})
  const [secondButtonOnclick, setSecondButtonOnclick] = useState<(e: MouseEvent) => void>(() => {})
  const [thirdButtonOnclick, setThirdButtonOnclick] = useState<(e: MouseEvent) => void>(() => {})
  const [thirdBtnHotkey, setThirdBtnHotkey] = useState('')

  const setMessage = (title: string, content: string, firstButton: string, secondButton: string, thirdButton?: string) => {
    setTitle(title)
    setContent(content)
    setFirstButton(firstButton)
    setSecondButton(secondButton)
    if (thirdButton) {
      setThirdButton(thirdButton)
    }
  }

  const setHandler = (
    firstButton: (e: MouseEvent) => void,
    secondButton: (e: MouseEvent) => void,
    thirdButton?: (e: MouseEvent) => void,
  ) => {
    setFirstButtonOnclick(() => firstButton)
    setSecondButtonOnclick(() => secondButton)
    if (thirdButton) {
      setThirdButtonOnclick(() => thirdButton)
    }
  }
  return {
    modalState,
    title,
    content,
    firstButton,
    secondButton,
    thirdButton,
    thirdBtnHotkey,
    firstButtonOnclick,
    secondButtonOnclick,
    thirdButtonOnclick,
    setModalState,
    setMessage,
    setHandler,
    setThirdBtnHotkey,
  }
}
