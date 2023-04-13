export interface IWordRecord {
  word: string
  timeStamp: number
  // 正常章节为 dictKey, 其他功能则为对应的类型
  dict: string
  // 用户可能是在 错题/其他类似组件中 进行的练习则为 null
  chapter: number | null
  // 正确次数中输入每个字母的时间差，可以据此计算出总时间
  timing: number[]
  // 出错的次数
  errorCount: number
  // 每个字母被错误输入成什么, index 为字母的索引, 数组内为错误的 KeyCode
  mistakes: Mistakes
}

interface Mistakes {
  // 每个字母被错误输入成什么, index 为字母的索引, 数组内为错误的 KeyCode
  [index: number]: number[]
}

export class WordRecord implements IWordRecord {
  word: string
  timeStamp: number
  dict: string
  chapter: number | null
  timing: number[]
  errorCount: number
  mistakes: Mistakes

  constructor(
    word: string,
    timeStamp: number,
    chapter: number | null,
    dict: string,
    timing: number[],
    errorCount: number,
    mistakes: Mistakes,
  ) {
    this.word = word
    this.timeStamp = timeStamp
    this.chapter = chapter
    this.dict = dict
    this.timing = timing
    this.errorCount = errorCount
    this.mistakes = mistakes
  }

  get totalTime() {
    return this.timing.reduce((acc, curr) => acc + curr, 0)
  }
}

export interface IChapterRecord {
  // 正常章节为 dictKey, 其他功能则为对应的类型
  dict: string
  // 用户可能是在 错题/其他类似组件中 进行的练习则为 null
  chapter: number | null
  timeStamp: number
  // 单位为 s，章节的记录没必要到毫秒级
  time: number
  // 正确按键次数，输对一个字母即记录
  correctCount: number
  // 错误的按键次数。 出错会清空整个输入，但只记录一次错误
  errorCount: number
  // 用户输入的单词总数，可能会使用循环等功能使输入总数大于 20
  wordNumber: number
  // 一次打对，未犯错，的单词数
  correctWordCount: number
  // 章节总单词数
  totalWordCount: number
}

export class ChapterRecord implements IChapterRecord {
  dict: string
  chapter: number | null
  timeStamp: number
  time: number
  correctCount: number
  errorCount: number
  wordNumber: number
  correctWordCount: number
  totalWordCount: number

  constructor(
    dict: string,
    chapter: number | null,
    timeStamp: number,
    time: number,
    correctCount: number,
    errorCount: number,
    wordNumber: number,
    correctWordCount: number,
    totalWordCount: number,
  ) {
    this.dict = dict
    this.chapter = chapter
    this.timeStamp = timeStamp
    this.time = time
    this.correctCount = correctCount
    this.errorCount = errorCount
    this.wordNumber = wordNumber
    this.correctWordCount = correctWordCount
    this.totalWordCount = totalWordCount
  }

  get wpm() {
    return Math.round((this.correctWordCount / this.time) * 60)
  }

  get inputAccuracy() {
    return Math.round((this.correctCount / this.correctCount + this.errorCount) * 100)
  }

  get wordAccuracy() {
    return Math.round((this.correctWordCount / this.totalWordCount) * 100)
  }
}
