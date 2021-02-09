import { useState, useCallback } from 'react'
import cet4 from 'assets/CET4_T.json'

export const dictList: any = {
  cet4: ['CET-4', ''],
  cet6: ['CET-6', './dicts/CET6_T.json'],
  gmat: ['GMAT', './dicts/GMAT_T.json'],
  gre: ['GRE', './dicts/GRE_T.json'],
  ielts: ['IELTS', './dicts/IELTS_T.json'],
  kaoyan: ['考研', './dicts/KaoYan_T.json'],
  level4: ['专四', './dicts/Level4_T.json'],
  level8: ['专八', './dicts/Level8_T.json'],
  sat: ['SAT', './dicts/SAT_T.json'],
  toefl: ['TOEFL', './dicts/TOEFL_T.json'],
  coder: ['Coder Dict', './dicts/it-words.json'],
  jsArray: ['js-array', './dicts/js-array.json'],
  jsDate: ['js-date', './dicts/js-date.json'],
  jsGlobal: ['js-global', './dicts/js-global.json'],
  jsMapSet: ['js-map-set', './dicts/js-map-set.json'],
  jsMath: ['js-math', './dicts/js-math.json'],
  jsNumber: ['js-number', './dicts/js-number.json'],
  jsObject: ['js-object', './dicts/js-object.json'],
  jsPromise: ['js-promise', './dicts/js-promise.json'],
  jsString: ['js-string', './dicts/js-string.json'],
  nodePath: ['Node-path', './dicts/Node-path.json'],
  nodeFs: ['Node-Fs', './dicts/Node0fs.json'],
  javeArrayList: ['java-arraylist', './dicts/java-arraylist.json'],
  javaCharacter: ['java-character', './dicts/java-character.json'],
  javaHashmap: ['java-hashmap', './dicts/java-hashmap.json'],
  javaLinkedList: ['java-linkedlist', './dicts/java-linkedlist.json'],
  javaString: ['java-string', './dicts/java-string.json'],
  javaStringBuffer: ['java-stringBuffer', './dicts/java-stringBuffer.json'],
  chuzhong: ['中考', './dicts/ChuZhongluan_2_T.json'],
  gaozhong: ['高考', './dicts/GaoZhongluan_2_T.json'],
  shangwu: ['商务英语', './dicts/BEC_2_T.json'],
  bec: ['BEC', './dicts/BEC_3_T.json'],
  san1: ['三年级上', './dicts/PEPXiaoXue3_1_T.json'],
  san2: ['三年级下', './dicts/PEPXiaoXue3_2_T.json'],
  si1: ['四年级上', './dicts/PEPXiaoXue4_1_T.json'],
  si2: ['四年级下', './dicts/PEPXiaoXue4_2_T.json'],
  wu1: ['五年级上', './dicts/PEPXiaoXue5_1_T.json'],
  wu2: ['五年级下', './dicts/PEPXiaoXue5_2_T.json'],
  liu1: ['六年级上', './dicts/PEPXiaoXue6_1_T.json'],
  liu2: ['六年级下', './dicts/PEPXiaoXue6_2_T.json'],
  qi1: ['七年级上', './dicts/PEPChuZhong7_1_T.json'],
  qi2: ['七年级下', './dicts/PEPChuZhong7_2_T.json'],
  ba1: ['八年级上', './dicts/PEPChuZhong8_1_T.json'],
  ba2: ['八年级下', './dicts/PEPChuZhong8_2_T.json'],
  jiu: ['九年级', './dicts/PEPChuZhong9_1_T.json'],
}

export type WordType = {
  name: string
  trans: string[]
  usphone: string
  ukphone: string
}

export type WordListDispatchType = (type: string, payload?: any, callback?: any) => void

export const useWordList = (
  InputchapterLength: number,
): [dictName: string, chapter: number, chapterListLength: number, wordList: WordType[], dispatch: WordListDispatchType] => {
  const [chapterLength, ,] = useState(InputchapterLength)
  const [dictName, setDictName] = useState<string>('cet4')
  const [chapter, setChapter] = useState<number>(0)
  const [dict, setDict] = useState(cet4)
  const [wordList, setWordList] = useState<WordType[]>(dict.slice(chapter * chapterLength, (chapter + 1) * chapterLength))
  const [chapterListLength, setChapterListLength] = useState<number>(Math.ceil(cet4.length / chapterLength))

  const dispatch: WordListDispatchType = useCallback(
    (type, payload, callback) => {
      switch (type) {
        case 'setDictName':
          setDictName(payload)

          if (payload === 'cet4') {
            const newDict = cet4
            setDict(newDict)
            setWordList(newDict.slice(0 * chapterLength, (0 + 1) * chapterLength))
            setChapterListLength(Math.ceil(newDict.length / chapterLength))
            if (callback !== undefined) {
              callback()
            }
          } else {
            fetch(dictList[payload][1])
              .then((response) => response.json())
              .then((data) => {
                const newDict = data
                setDict(newDict)
                setWordList(newDict.slice(0 * chapterLength, (0 + 1) * chapterLength))
                setChapterListLength(Math.ceil(newDict.length / chapterLength))
                if (callback !== undefined) {
                  callback()
                }
              })
          }
          break
        case 'setChapter':
          setChapter(payload)
          setWordList(dict.slice(payload * chapterLength, (payload + 1) * chapterLength))
          break
      }
    },
    [chapterLength, dict],
  )

  return [dictName, chapter, chapterListLength, wordList, dispatch]
}
