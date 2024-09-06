import Flow from './flow'
import logo from '@/assets/logo.svg'
import type React from 'react'

const MobilePage: React.FC = () => {
  return (
    <div className="flex h-screen w-screen flex-col">
      <section className="flex items-center justify-center py-2 shadow-md">
        <img src={logo} className="mr-3 h-16 w-16" alt="Qwerty Learner Logo" />
        <h1 className="text-2xl font-bold text-primary">Qwerty Learner</h1>
      </section>

      <section className="relative">
        <Flow />
        <div className="absolute top-10  flex w-full  flex-col items-center justify-center">
          <h1 className="animate__animated animate__zoomIn bg-gradient-to-b from-white to-[#dee0ff] bg-clip-text text-3xl font-bold text-transparent">
            为键盘工作者设计的软件
          </h1>
          <h2
            className="animate__animated animate__zoomIn   mt-5 text-[10px] font-bold text-[#f0f0f0]"
            style={{
              textShadow: '1px 1px 2px #9c9ea3',
            }}
          >
            简化英语学习与打字技能提升过程，快速建立正确的肌肉记忆
          </h2>
          <h2
            className="typewriter !mt-3 text-[10px] font-bold text-[#f0f0f0]"
            style={{
              textShadow: '1px 1px 2px #9c9ea3',
              overflow: 'hidden',
              borderRight: '0.15em solid #f0f0f0',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              animation: 'typing 3s steps(50), blink-caret 0.75s step-end 4, hideCaret 0s 3s forwards',
            }}
          >
            单词记忆与键盘输入相结合、音标发音与默写模式、多样化词库选择
          </h2>
          <div className="mt-8 flex h-[50px] items-center rounded-[20px] bg-primary px-[15px] text-xl font-bold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.1)]">
            电脑端使用
          </div>
        </div>
      </section>

      <section></section>
    </div>
  )
}

export default MobilePage
