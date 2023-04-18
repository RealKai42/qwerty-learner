import { isTextSelectableAtom } from '@/store'
import { useAtomValue } from 'jotai'

export type TranslationProps = {
  trans: string
}
export default function Translation({ trans }: TranslationProps) {
  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  return (
    <div
      className={`max-w-4xl pb-4 pt-5 font-sans text-lg transition-colors duration-300 dark:text-white dark:text-opacity-80 ${
        !isTextSelectable && 'select-none'
      }`}
    >
      {trans}
    </div>
  )
}
