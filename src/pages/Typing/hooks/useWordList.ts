import { isRestartRevisionProgressAtom } from './../../../store/index'
import { WordRecord } from './../../../utils/db/record'
import { CHAPTER_LENGTH } from '@/constants'
import { currentChapterAtom, currentDictInfoAtom, isInRevisionModeAtom } from '@/store'
import type { WordWithIndex } from '@/typings/index'
import { db } from '@/utils/db'
import type { IWordRecord } from '@/utils/db/record'
import { wordListFetcher } from '@/utils/wordListFetcher'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

export type UseWordListResult = {
  words: WordWithIndex[] | undefined
  isLoading: boolean
  error: Error | undefined
}

/**
 * Use word lists from the current selected dictionary.
 */
export function useWordList(): UseWordListResult {
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const [currentChapter, setCurrentChapter] = useAtom(currentChapterAtom)
  const [isInRevisionMode] = useAtom(isInRevisionModeAtom)
  const [isRestartRevisionProgress, setRestartRevisionProgress] = useAtom(isRestartRevisionProgressAtom)
  const [wrongListDesc, setWrongListDesc] = useState<IWordRecord[]>()

  const isFirstChapter = currentDictInfo.id === 'cet4' && currentChapter === 0 && !isInRevisionMode

  // Reset current chapter to 0, when currentChapter is greater than chapterCount.
  if (currentChapter >= currentDictInfo.chapterCount) {
    setCurrentChapter(0)
  }

  useEffect(() => {
    const fetchWrongList = async () => {
      let lastErrorList: IWordRecord[] = []
      lastErrorList = await db.revisionWordRecords.where('dict').equals(currentDictInfo.id).toArray()
      console.log(lastErrorList)
      if (lastErrorList.length === 0 || isRestartRevisionProgress) {
        //获取最新的wrongRecords
        if (lastErrorList.length === 0)
          await db.revisionDictRecords.add({ dict: currentDictInfo.id, revisionIndex: 0, createdTime: Date.now() })
        if (isRestartRevisionProgress)
          await db.revisionDictRecords.where('dict').equals(currentDictInfo.id).modify({ revisionIndex: 0, createdTime: Date.now() })
        setRestartRevisionProgress(false)
        const wrongList = await db.wordRecords
          .where('wrongCount')
          .above(0)
          .and((record) => record.dict === currentDictInfo.id)
          .reverse()
          .toArray()
        const processedWrongList = wrongList.map((record) => {
          return new WordRecord(record.word, record.dict, record.chapter, record.timing, record.wrongCount, record.mistakes)
        })
        wrongList.length !== 0 && (await db.revisionWordRecords.bulkAdd(processedWrongList))
        lastErrorList = await db.revisionWordRecords.where('dict').equals(currentDictInfo.id).toArray()
      }
      setWrongListDesc(lastErrorList)
    }
    if (isInRevisionMode) {
      fetchWrongList()
    }
  }, [isInRevisionMode, currentDictInfo.id, isRestartRevisionProgress, setRestartRevisionProgress])

  const { data: wordList, error, isLoading } = useSWR(currentDictInfo.url, wordListFetcher)

  const words: WordWithIndex[] = useMemo(() => {
    const newWords = isFirstChapter
      ? firstChapter
      : wordList
      ? isInRevisionMode
        ? wordList
            .filter(
              (word, index, self) =>
                self.findIndex((w) => w.name === word.name) === index &&
                wrongListDesc?.find((wrong) => wrong.dict === currentDictInfo.id && wrong.word === word.name),
            )
            .sort((a, b) => {
              const aWrong = wrongListDesc?.find((wrong) => wrong.dict === currentDictInfo.id && wrong.word === a.name)
              const bWrong = wrongListDesc?.find((wrong) => wrong.dict === currentDictInfo.id && wrong.word === b.name)
              if ((bWrong?.wrongCount ?? 0) - (aWrong?.wrongCount ?? 0) === 0) return a.name.localeCompare(b.name)
              else return (bWrong?.wrongCount ?? 0) - (aWrong?.wrongCount ?? 0)
            })
        : wordList.slice(currentChapter * CHAPTER_LENGTH, (currentChapter + 1) * CHAPTER_LENGTH)
      : []
    // 记录原始 index
    return newWords.map((word, index) => ({ ...word, index }))
  }, [isFirstChapter, wordList, currentChapter, currentDictInfo, isInRevisionMode, wrongListDesc])

  return { words: wordList === undefined ? undefined : words, isLoading, error }
}

const firstChapter = [
  { name: 'cancel', trans: ['取消， 撤销； 删去'], usphone: "'kænsl", ukphone: "'kænsl" },
  { name: 'explosive', trans: ['爆炸的； 极易引起争论的', '炸药'], usphone: "ɪk'splosɪv; ɪk'splozɪv", ukphone: "ɪk'spləusɪv" },
  { name: 'numerous', trans: ['众多的'], usphone: "'numərəs", ukphone: "'njuːmərəs" },
  { name: 'govern', trans: ['居支配地位， 占优势', '统治，治理，支配'], usphone: "'ɡʌvɚn", ukphone: "'gʌvn" },
  { name: 'analyse', trans: ['分析； 分解； 解析'], usphone: "'æn(ə)laɪz", ukphone: "'ænəlaɪz" },
  { name: 'discourage', trans: ['使泄气， 使灰心； 阻止， 劝阻'], usphone: "dɪs'kɝɪdʒ", ukphone: "dɪs'kʌrɪdʒ" },
  { name: 'resemble', trans: ['像， 类似于'], usphone: "rɪ'zɛmbl", ukphone: "rɪ'zembl" },
  {
    name: 'remote',
    trans: ['遥远的； 偏僻的； 关系疏远的； 脱离的； 微乎其微的； 孤高的， 冷淡的； 遥控的'],
    usphone: "rɪ'mot",
    ukphone: "rɪ'məut",
  },
  { name: 'salary', trans: ['薪金， 薪水'], usphone: "'sæləri", ukphone: "'sæləri" },
  { name: 'pollution', trans: ['污染， 污染物'], usphone: "pə'luʃən", ukphone: "pə'luːʃn" },
  { name: 'pretend', trans: ['装作， 假装'], usphone: "prɪ'tɛnd", ukphone: "prɪ'tend" },
  { name: 'kettle', trans: ['水壶'], usphone: "'kɛtl", ukphone: "'ketl" },
  { name: 'wreck', trans: ['失事；残骸；精神或身体已垮的人', '破坏'], usphone: 'rɛk', ukphone: 'rek' },
  { name: 'drunk', trans: ['醉的； 陶醉的'], usphone: 'drʌŋk', ukphone: 'drʌŋk' },
  { name: 'calculate', trans: ['计算； 估计； 计划'], usphone: "'kælkjulet", ukphone: "'kælkjuleɪt" },
  { name: 'persistent', trans: ['坚持的， 不屈不挠的； 持续不断的； 反复出现的'], usphone: "pə'zɪstənt", ukphone: "pə'sɪstənt" },
  { name: 'sake', trans: ['缘故， 理由'], usphone: 'sek', ukphone: 'seɪk' },
  { name: 'conceal', trans: ['把…隐藏起来， 掩盖， 隐瞒'], usphone: "kən'sil", ukphone: "kən'siːl" },
  { name: 'audience', trans: ['听众， 观众， 读者'], usphone: "'ɔdɪəns", ukphone: "'ɔːdiəns" },
  { name: 'meanwhile', trans: ['与此同时'], usphone: "'minwaɪl", ukphone: "'miːnwaɪl" },
]
