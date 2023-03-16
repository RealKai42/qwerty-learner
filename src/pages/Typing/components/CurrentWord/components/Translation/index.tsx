export type TranslationProps = {
  trans: string
}
export default function Translation({ trans }: TranslationProps) {
  return (
    <div className="max-w-4xl pt-5 pb-4 font-sans text-lg transition-colors duration-300 dark:text-white dark:text-opacity-80">{trans}</div>
  )
}
