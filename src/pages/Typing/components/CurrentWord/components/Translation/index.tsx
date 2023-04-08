export type TranslationProps = {
  trans: string
}
export default function Translation({ trans }: TranslationProps) {
  return (
    <div className="max-w-4xl pb-4 pt-5 font-sans text-lg transition-colors duration-300 dark:text-white dark:text-opacity-80">{trans}</div>
  )
}
