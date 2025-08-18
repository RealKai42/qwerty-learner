import { TypingContext } from '../../../../store'
import { fontSizeConfigAtom } from '@/store'
import { wordDictationConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useMemo } from 'react'

export type ExampleProps = {
  example: string
  showExample?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function Example({ example, showExample = true, onMouseEnter, onMouseLeave }: ExampleProps) {
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const { state, dispatch } = useContext(TypingContext)!

  const currentWord = state.chapterData.words[state.chapterData.index]
  const allWords = state.chapterData.words

  const wordDictationConfig = useAtomValue(wordDictationConfigAtom)
  const showCurrentWord = !wordDictationConfig.isOpen

  const exampleWords = useMemo(() => {
    return example.split(/\s+/).map((word) => ({
      original: word,
      // 清理单词中的标点符号（保留原始显示）
      cleanName: word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, ''),
    }))
  }, [example])

  const renderWords = useCallback(() => {
    const processedWords = new Set<string>()

    return exampleWords.map(({ original, cleanName }, index) => {
      const isRepeated = processedWords.has(cleanName)
      const isInWordList = allWords.some((w) => w.name === cleanName)
      const isCurrent = currentWord?.name === cleanName

      if (!isRepeated) processedWords.add(cleanName)

      // 判断是否需要隐藏当前词
      const shouldMask = !showCurrentWord && isCurrent
      // 生成下划线（保留原始单词长度包括标点）
      const mask = '_'.repeat(original.length)

      let className = ''
      if (!isRepeated && isInWordList) {
        className = isCurrent ? 'example-typing' : 'example-pre-type'
      }

      return (
        <span key={index} className={`${className} ${shouldMask ? 'example-mask' : ''}`}>
          {shouldMask ? mask : original}
          {index < exampleWords.length - 1 && ' '}
        </span>
      )
    })
  }, [exampleWords, allWords, currentWord, showCurrentWord])

  return (
    <div className={`flex items-center justify-center pb-4 pt-5`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div
        className={`max-w-4xl text-center font-sans transition-colors duration-300 dark:text-white dark:text-opacity-80`}
        style={{ fontSize: fontSizeConfig.translateFont.toString() + 'px' }}
      >
        {showExample ? renderWords() : '\u00A0'}
      </div>
    </div>
  )
}
