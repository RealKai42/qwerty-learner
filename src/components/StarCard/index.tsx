import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import starbar from '@/assets/starbar.png'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'react-use'

type StarCardProps = {
  setShow: (e: boolean) => void
}

const StarCard: React.FC<StarCardProps> = ({ setShow }) => {
  const [wantStar, setWantStar] = useState(false)
  const [second, setSecond] = useState(3)
  const [_, setValue] = useLocalStorage('star')
  const timer = useRef<NodeJS.Timer | null>(null)

  const closeStar = () => {
    setShow(false)
  }

  useEffect(() => {
    if (wantStar && timer.current === null) {
      timer.current = setInterval(() => {
        setSecond((e) => e - 1)
      }, 1000)
    } else if (second === 0) {
      clearInterval(timer.current!)
      closeStar()
      setValue(true)
    }
  }, [wantStar, second])

  return (
    <Transition
      show={true}
      enter="ease-in duration-300"
      enterFrom="opacity-0 -top-10"
      enterTo="opacity-100 top-0"
      leave="ease-out duration-100"
      leaveFrom="opacity-100 top-0"
      leaveTo="opacity-0 -top-10"
      className="fixed inset-0 z-20 flex h-0 justify-center"
    >
      <div className=" absolute top-10 flex h-80 flex-col items-center justify-evenly rounded-xl bg-white p-10 shadow-2xl dark:bg-gray-800">
        <div className="absolute top-5 right-7">
          {wantStar && (
            <span className="m-1.5">
              <span className="text-indigo-600">{second}s</span>
              后自动关闭
            </span>
          )}
          <button onClick={closeStar}>
            <FontAwesomeIcon icon={['fas', 'times-circle']} className="text-indigo-400" size="lg" />
          </button>
        </div>
        <span className="pb-4 text-xl text-gray-600 dark:text-gray-50">
          坚持练习，提高语言能力。将 <span className="text-indigo-600">「Qwerty Learner」</span>保存到收藏夹，永不迷失！
        </span>
        {wantStar ? (
          <>
            <div className="flex">
              <img src={starbar} alt="" className="" />
              <span className="px-6">点亮它，谢谢！</span>
            </div>
            <span className="w-full">
              收藏快捷键<span className="text-indigo-600">cmd + d</span>{' '}
            </span>
          </>
        ) : (
          <div className="flex gap-x-5">
            <button
              onClick={() => {
                setValue(true)
                closeStar()
              }}
              className="rounded-lg border-2 border-indigo-600 px-6 py-2 text-lg transition-colors duration-300 focus:outline-none dark:text-white"
            >
              不再提醒
            </button>
            <button
              onClick={() => setWantStar(true)}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-lg text-white transition-colors duration-300 focus:outline-none"
            >
              我想收藏
            </button>
          </div>
        )}
      </div>
    </Transition>
  )
}

export default StarCard
