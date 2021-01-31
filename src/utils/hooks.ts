import React, { useState, MouseEvent } from 'react'

export const useModals = (initialState: boolean, initialTitle: string) => {
  const [modalState, setModalState] = useState<boolean>(initialState)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState('')
  const [firstButton, setFirstButton] = useState('')
  const [secondButton, setSecondButton] = useState('')
  const [firstButtonOnclick, setFirstButtonOnclick] = useState<(e: MouseEvent) => void>(() => {})
  const [secondButtonOnclick, setSecondButtonOnclick] = useState<(e: MouseEvent) => void>(() => {})

  const setMessage = (title: string, content: string, firstButton: string, secondButton: string) => {
    setTitle(title)
    setContent(content)
    setFirstButton(firstButton)
    setSecondButton(secondButton)
  }

  const setHandler = (firstButton: (e: MouseEvent) => void, secondButton: (e: MouseEvent) => void) => {
    setFirstButtonOnclick(() => firstButton)
    setSecondButtonOnclick(() => secondButton)
  }
  return {
    modalState,
    title,
    content,
    firstButton,
    secondButton,
    firstButtonOnclick,
    secondButtonOnclick,
    setModalState,
    setMessage,
    setHandler,
  }
}
