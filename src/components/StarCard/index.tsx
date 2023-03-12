import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import starbar from '@/assets/starbar.png'

const StarCard: React.FC = () => {
  return (
    <Transition
      show={true}
      enter="ease-in duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-out duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="fixed inset-0 z-10 flex h-0 justify-center"
    >
      <div className=" absolute top-10 flex h-80 flex-col items-center justify-evenly rounded-xl bg-white p-10 shadow-2xl dark:bg-gray-800">
        <button className="absolute top-5 right-7">
          <FontAwesomeIcon icon={['fas', 'times-circle']} className="text-indigo-400" size="lg" />
        </button>
        <span className="pb-4 text-xl text-gray-600 dark:text-gray-50">
          坚持练习，提高语言能力。将 <span className="text-indigo-600">「Qwerty Learner」</span>保存到收藏夹，永不迷失！
        </span>
        {/* <div className="flex">
          <img src={starbar} alt="" className="" />
          <span className='px-6'>点亮它，谢谢！</span>
        </div> */}
        <button className="rounded-lg bg-indigo-600 px-6 py-2 text-lg text-white transition-colors duration-300 focus:outline-none">
          我想收藏
        </button>
      </div>
    </Transition>
  )
}

export default StarCard
