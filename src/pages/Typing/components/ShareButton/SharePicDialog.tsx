import { TypingContext } from '../../store'
import shareImage1 from '@/assets/sharePic/image-1.png'
import shareImage2 from '@/assets/sharePic/image-2.png'
import shareImage3 from '@/assets/sharePic/image-3.png'
import shareImage4 from '@/assets/sharePic/image-4.png'
import shareImage5 from '@/assets/sharePic/image-5.png'
import shareImage6 from '@/assets/sharePic/image-6.png'
import shareImage7 from '@/assets/sharePic/image-7.png'
import shareImage8 from '@/assets/sharePic/image-8.png'
import shareImage9 from '@/assets/sharePic/image-9.png'
import keyboardSvg from '@/assets/sharePic/keyBackground.svg'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import { recordShareAction } from '@/utils'
import { Dialog, Transition } from '@headlessui/react'
import { useAtomValue } from 'jotai'
import { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import IconXMark from '~icons/heroicons/x-mark-solid'

const PIC_RATIO = 3
const PIC_LIST = [shareImage1, shareImage2, shareImage3, shareImage4, shareImage5, shareImage6, shareImage7, shareImage8, shareImage9]
// 我知道有些有点怪，但怪的有趣(狗头)，powered by chatGPT
const PROMOTE_LIST = [
  { word: '快人一手', sentence: '速度快得就像比别人多长了一只手' },
  { word: '手落听雨', sentence: '雷霆手法，震撼观众' },
  { word: '疾如闪电', sentence: '打字速度极快，就像一道闪电在键盘上迅速穿梭' },
  { word: '手如疾风', sentence: '手速快得惊人，就像疾风一般' },
  { word: '精准如箭', sentence: '打字精度极高，就像一箭命中靶心一般准确' },
  { word: '狂飙突进', sentence: '打字速度快得让人感到狂飙突进的冲劲' },
  { word: '神速如风', sentence: '神速打字，如同风一样快' },
  { word: '招招到位', sentence: '打字精度和速度都十分到位，毫不出错。' },
  { word: '如履平地', sentence: '打字手法熟练，如履平地，行云流水' },
  { word: '声东击西', sentence: '打字技巧高超，声东击西，出奇制胜' },
  { word: '魔法使者', sentence: '打字速度快得让人难以置信，就像一名魔法使者。' },
  { word: '灵活多变', sentence: '打字姿势灵活多变，就像一只蛇一样柔韧。' },
  { word: '犹如飞鸟', sentence: '打字速度极快，就像一只飞鸟在键盘上翱翔。' },
  { word: '连珠妙语', sentence: '打字技巧娴熟，如同一连串妙语连珠。' },
  { word: '百毒不侵', sentence: '打字速度和准确度都非常高，就像身具百毒不侵的能力。' },
  { word: '攻守兼备', sentence: '打字速度和精度都非常出色，攻守兼备，所向披靡。' },
  { word: '跃然纸上', sentence: '打字手法灵活多变，跃然纸上，生动有趣。' },
]

export type SharePicDialogProps = {
  showState: boolean
  setShowState: (showState: boolean) => void
  randomChoose: {
    picRandom: number
    promoteRandom: number
  }
}

export default function SharePicDialog({ showState, setShowState, randomChoose }: SharePicDialogProps) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const imageRef = useRef<HTMLDivElement>(null)
  const [imageURL, setImageURL] = useState<string | null>(null)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentChapter = useAtomValue(currentChapterAtom)

  const dialogFocusRef = useRef<HTMLButtonElement>(null)

  const shareImage = useMemo(() => PIC_LIST[Math.floor(randomChoose.picRandom * PIC_LIST.length)], [randomChoose.picRandom])
  const promote = useMemo(() => PROMOTE_LIST[Math.floor(randomChoose.promoteRandom * PROMOTE_LIST.length)], [randomChoose.promoteRandom])

  useEffect(() => {
    async function loadToPng() {
      const { toPng } = await import('html-to-image')

      if (imageRef.current) {
        const width = imageRef.current.offsetWidth
        const height = imageRef.current.offsetHeight
        toPng(imageRef.current, { canvasWidth: width * PIC_RATIO, canvasHeight: height * PIC_RATIO }).then((url) => {
          setImageURL(url)
        })
      }
    }

    loadToPng()
  }, [])

  const handleDownload = useCallback(async () => {
    const { saveAs } = await import('file-saver')

    if (imageURL) {
      saveAs(imageURL, 'Qwerty-learner.png')
      recordShareAction('download')
    }
  }, [imageURL])

  const handleClose = useCallback(() => {
    setShowState(false)
  }, [setShowState])

  return (
    <>
      <Transition.Root show={showState}>
        <Dialog as="div" className="relative z-50" onClose={handleClose} initialFocus={dialogFocusRef}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all  dark:bg-gray-700">
                  <div className="flex flex-col items-center justify-center pb-10 pl-20 pr-14 pt-20">
                    <button className="absolute right-7 top-5" type="button" onClick={handleClose} title="关闭对话框">
                      <IconXMark className="h-6 w-6 text-gray-400" />
                    </button>
                    <div className="h-152 w-116">
                      {imageURL ? (
                        <img src={imageURL} className="h-auto w-full" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-solid border-white">
                          <svg
                            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-50" cx="12" cy="12" r="10" stroke="rgb(129 140 248)" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      ref={dialogFocusRef}
                      className="my-btn-primary mr-9 mt-10 h-10"
                      type="button"
                      onClick={handleDownload}
                      title="保存"
                    >
                      保存
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div style={{ position: 'absolute', left: '-999px', zIndex: -1 }}>
        <div ref={imageRef} className=" box-content w-85 bg-white p-4">
          <div
            className="relative flex h-112 w-75 flex-col items-start justify-start rounded-xl shadow-lg"
            style={{ backgroundColor: '#F8F8FF' }}
          >
            <div className=" w-full ">
              <KeyboardPanel description={promote.word} />
              <div className="text-center text-xs text-gray-500">{promote.sentence}</div>
              <div className="mx-4 mt-6 flex rounded-xl bg-white px-4 py-3 opacity-50 shadow-xl">
                <DataBox data={state.timerData.time + ''} description="用时" />
                <DataBox data={state.timerData.accuracy + '%'} description="正确率" />
                <DataBox data={state.timerData.wpm + ''} description="WPM" />
              </div>
              <div className="ml-5 mt-4 self-start text-base text-gray-800">{currentDictInfo.name}</div>
              <div className="ml-5 mt-2 self-start text-xs text-gray-600">{`第 ${currentChapter + 1} 章`}</div>
            </div>
            <div className="mb-3 ml-5 mt-auto">
              <div className="text-xs">Qwerty.kaiyi.cool</div>
              <div className="mt-1 text-xs font-normal text-gray-400">为键盘工作者设计的单词与肌肉记忆锻炼软件</div>
            </div>
            <div className="absolute -right-9 bottom-10 ">
              <img src={shareImage} className="w-48" width={186} height={122} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function DataBox({ data, description }: { data: string; description: string }) {
  return (
    <div className="flex w-20 flex-1 flex-col items-center justify-center">
      <span className="w-4/5 text-center text-base font-normal text-gray-600 ">{data}</span>
      <span className="pt-2 text-xs text-gray-400">{description}</span>
    </div>
  )
}

function KeyboardPanel({ description }: { description: string }) {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-0">
      {description.split('').map((char, index) => (
        <KeyboardKey key={`${index}-${char}`} char={char} />
      ))}
    </div>
  )
}

function KeyboardKey({ char }: { char: string }) {
  return (
    <div className="relative -mx-1 h-18 w-18">
      <div className="absolute bottom-0 left-0 right-0 top-0">
        <img src={keyboardSvg} className="h-full w-full" />
      </div>
      <div className="absolute left-0 right-0 top-2.5 flex items-center justify-center">
        <span className="text-base font-normal text-white" style={{ fontSize: '20px', transform: 'rotateX(30deg) ' }}>
          {char}
        </span>
      </div>
    </div>
  )
}
