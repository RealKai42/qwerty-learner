import type { TypingGameConfig } from '@/@types/game'
import type { SetStateAction } from 'jotai'
import type { Dispatch } from 'react'

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result
export type TypingGameFontSetting = TypingGame['fontSetting']
export type TypingGameState = TypingGame['state']
export type TypingGameLevel = TypingGame['level']

export default class TypingGame {
  readonly target: HTMLCanvasElement | null
  private state: 'init' | 'running' | 'win' | 'gameover' | 'paused'
  onStateChange: Dispatch<React.SetStateAction<TypingGame['state']>>
  life: number
  private lifeLeft: number
  onLifeChange: SetAtom<[SetStateAction<TypingGameConfig>], void>
  level: 1 | 2 | 3 | 4
  words: string[]
  private wordsLeft: string[]
  private speed: 1 | 2 | 3 | 4
  private readonly wordsPosition: { x: number; y: number }[] = []
  private readonly fontSetting: {
    font: CanvasRenderingContext2D['font']
    fillStyle: CanvasRenderingContext2D['fillStyle']
  } = { font: '48px Menlo', fillStyle: '#000' }

  private readonly RIGHT_PADDING = 30
  private readonly WORD_PADDING = 30

  private ctx: CanvasRenderingContext2D | null = null
  private canvasWidth = 0
  private canvasHeight = 0
  private animationFrameId: number | null = null

  private wordNeedToWipe = ''

  constructor(
    target: TypingGame['target'],
    level: TypingGame['level'],
    life: TypingGame['life'],
    words: TypingGame['words'],
    onStateChange: TypingGame['onStateChange'],
    onLifeChange: TypingGame['onLifeChange'],
    fontSetting?: Partial<TypingGame['fontSetting']>,
  ) {
    this.target = target
    this.state = 'init'
    this.level = level
    this.speed = level
    this.life = life
    this.lifeLeft = life
    this.words = [...words]
    this.wordsLeft = this.words
    this.onStateChange = onStateChange
    this.onLifeChange = onLifeChange

    fontSetting ? this.changeFontSetting(fontSetting) : null
    this.init()
  }

  changeFontSetting({ font, fillStyle }: Partial<TypingGame['fontSetting']>) {
    font ? (this.fontSetting.font = font) : null
    fillStyle ? (this.fontSetting.fillStyle = fillStyle) : null
    this.setFontStyle()
    this.draw()
  }

  // change life, level, words
  changeGameSetting({ life, level, words }: Partial<Pick<TypingGame, 'life' | 'level' | 'words'>>) {
    life && (this.life = life)
    level && (this.level = level) && (this.speed = this.level)
    words && (this.words = words)
    this.init()
  }

  init() {
    this.state = 'init'
    this.lifeLeft = this.life
    this.wordsLeft = this.words
    this.onLifeChange((config) => ({
      ...config,
      lifeLeft: this.lifeLeft.toString() as TypingGameConfig['lifeLeft'],
    }))
    this.onStateChange('init')
    if (!this.target) return
    this.ctx = this.target.getContext('2d')
    if (!this.ctx) return
    // fix text appears blurry on canvas
    const ratio = window.devicePixelRatio || 1
    const { width, height } = this.target.getBoundingClientRect()
    this.canvasWidth = width
    this.canvasHeight = height
    this.target.width = width * ratio
    this.target.height = height * ratio
    this.ctx.scale(ratio, ratio)

    this.setFontStyle()
    this.formatWordsPosition()
    this.draw()
  }

  private setFontStyle() {
    if (!this.ctx) return
    this.ctx.font = this.fontSetting.font
    this.ctx.fillStyle = this.fontSetting.fillStyle
  }

  private formatWordsPosition() {
    if (!this.ctx) return
    this.wordsPosition.length = 0
    let lineWordsXPosition = this.WORD_PADDING
    let lineWordsYPosition = 0
    for (const word of this.words) {
      const currentWordPosition = { x: lineWordsXPosition, y: lineWordsYPosition }
      const textMetrics = this.ctx.measureText(word)
      const singleWordWidth = textMetrics.width
      const singleWordHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent

      if (lineWordsYPosition === 0) {
        lineWordsYPosition -= singleWordHeight
        currentWordPosition.y = lineWordsYPosition
      }
      if (lineWordsXPosition + this.WORD_PADDING + singleWordWidth + this.RIGHT_PADDING < this.canvasWidth) {
        lineWordsXPosition += this.WORD_PADDING + singleWordWidth
      } else {
        lineWordsYPosition -= singleWordHeight + this.WORD_PADDING
        currentWordPosition.y = lineWordsYPosition
        currentWordPosition.x = this.WORD_PADDING
        lineWordsXPosition = this.WORD_PADDING + singleWordWidth + this.WORD_PADDING
      }
      this.wordsPosition.push(currentWordPosition)
    }
  }

  private run() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.draw()
    this.move()

    if (this.state === 'running') {
      this.animationFrameId = requestAnimationFrame(() => this.run())
    }
  }

  pause() {
    this.state = 'paused'
  }

  resume() {
    this.state = 'running'
    this.paintCover('Go!')
    setTimeout(() => this.run(), 1000)
  }

  private draw() {
    switch (this.state) {
      case 'running':
        this.paint()
        break
      case 'gameover':
        this.paintCover('Game Over!')
        break
      case 'win':
        this.paintCover('You Win!')
        break
      case 'paused':
        this.paintCover('Paused!')
        break
      default:
        this.paintCover('Ready to Go!')
    }
  }

  private paintCover(words: string) {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

    const textMetrics = this.ctx.measureText(words)
    const singleWordWidth = textMetrics.width
    const singleWordHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent
    const midX = (this.canvasWidth - singleWordWidth) / 2
    const midY = (this.canvasHeight - singleWordHeight) / 2
    this.ctx.fillText(words, midX, midY)
  }

  private paint() {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    const len = this.wordsLeft.length
    for (let i = 0; i < len; i++) {
      const word = this.wordsLeft[i]
      const position = this.wordsPosition[i]
      this.ctx.fillText(word, position.x, position.y)
    }
  }

  private move() {
    const len = this.wordsLeft.length
    for (let i = 0; i < len; i++) {
      const word = this.wordsLeft.shift()
      const position = this.wordsPosition.shift()
      if (!word || !position) continue
      position.y += this.speed / 13

      if (word === this.wordNeedToWipe) continue

      if (position.y <= this.canvasHeight) {
        this.wordsLeft.push(word)
        this.wordsPosition.push(position)
      } else {
        this.lifeLeft = this.lifeLeft === 0 ? 0 : this.lifeLeft - 1
        this.onLifeChange((config) => ({
          ...config,
          lifeLeft: this.lifeLeft.toString() as TypingGameConfig['lifeLeft'],
        }))
      }
      if (this.lifeLeft <= 0) {
        this.state = 'gameover'
        this.draw()
        this.onStateChange('gameover')
      }
      if (this.wordsLeft.length === 0) {
        this.state = 'win'
        this.draw()
        this.onStateChange('win')
      }
    }
  }

  wipeOut(word: string) {
    this.wordNeedToWipe = word
  }
}
