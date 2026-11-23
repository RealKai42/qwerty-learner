import KeyEventHandler from '../KeyEventHandler'
import TextAreaHandler from '../TextAreaHandler'
import { currentDictInfoAtom } from '@/store'
import { useAtomValue } from 'jotai'
import type { FormEvent } from 'react'
import { useMemo } from 'react'

export default function InputHandler({
  updateInput,
  onImeText,
}: {
  updateInput: (updateObj: WordUpdateAction) => void
  onImeText?: () => void
}) {
  const dictInfo = useAtomValue(currentDictInfoAtom)

  const handler = useMemo(() => {
    switch (dictInfo.language) {
      case 'en':
      case 'de':
      case 'romaji':
        return <KeyEventHandler updateInput={updateInput} onImeText={onImeText} />
      default:
        return <TextAreaHandler updateInput={updateInput} />
    }
  }, [dictInfo.language, onImeText, updateInput])

  return <>{handler}</>
}
export type WordUpdateAction = WordAddAction | WordDeleteAction | WordCompositionAction

export type WordAddAction = {
  type: 'add'
  value: string
  event: FormEvent<HTMLTextAreaElement> | KeyboardEvent
}

export type WordDeleteAction = {
  type: 'delete'
  length: number
}

// composition api is not ready yet
export type WordCompositionAction = {
  type: 'composition'
  value: string
}
