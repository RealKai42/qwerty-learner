import logo from '@/assets/logo.svg'
import directoryImg from '@/assets/mobile/carousel/directory.png'
import hotImg from '@/assets/mobile/carousel/hot.png'
import indexImg from '@/assets/mobile/carousel/index.png'
import codeImg from '@/assets/mobile/detail/code.png'
import dictationImg from '@/assets/mobile/detail/dictation.png'
import phoneticImg from '@/assets/mobile/detail/phonetic.png'
import speedImg from '@/assets/mobile/detail/speed.png'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

const detail = [
  {
    title: '音标显示与发音功能',
    description: '帮助用户同时记忆单词的读音与音标',
    img: phoneticImg,
  },
  {
    title: '默写模式',
    description: '每章结束后可选择默写，巩固所学单词',
    img: dictationImg,
  },
  {
    title: '实时反馈',
    description: '显示输入速度和正确率，量化技能提升',
    img: speedImg,
  },
  {
    title: '为程序员定制',
    description: '内置编程相关词库，提高工作效率',
    img: codeImg,
  },
]

const MobilePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 3 // 轮播图的总数量
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const slideWidth = container.offsetWidth

      if (currentSlide === 0) {
        container.style.transform = `translateX(-${totalSlides * slideWidth}px)`
        setTimeout(() => {
          container.style.transition = 'none'
          container.style.transform = `translateX(0)`
        }, 500)
      } else {
        container.style.transition = 'transform 0.5s ease'
        container.style.transform = `translateX(-${currentSlide * slideWidth}px)`
      }
    }
  }, [currentSlide])

  return (
    <div className="flex w-screen flex-col  items-center bg-white lg:mx-auto lg:max-w-7xl">
      {/* <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-100/50 bg-white/80 px-6 py-6 backdrop-blur-xl lg:px-12">
        <div className="flex items-center">
          <img src={logo} className="mr-4 h-10 w-10 lg:h-12 lg:w-12" alt="Qwerty Learner Logo" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight text-indigo-500 lg:text-xl">Qwerty Learner</h1>
            <span className="text-xs font-normal text-gray-500">官方网站</span>
          </div>
        </div>
        <a
          href="https://qwerty.kaiyi.cool/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg md:flex"
        >
          <span>访问官网</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
        <a
          href="https://qwerty.kaiyi.cool/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white transition-all duration-200 hover:bg-gray-800 md:hidden"
        >
          <span>官网</span>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </header> */}
      <span>请使用桌面端浏览器访问</span>
      {/* 面包屑导航 */}
      {/* <nav aria-label="面包屑导航" className="bg-gray-50/50 px-6 py-3 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <ol className="flex items-center space-x-2 text-sm text-gray-500" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a href="https://qwerty.kaiyi.cool/" className="transition-colors hover:text-indigo-600" itemProp="item">
                <span itemProp="name">首页</span>
              </a>
              <meta itemProp="position" content="1" />
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="font-medium text-gray-900" itemProp="name">
                Qwerty Learner 官网
              </span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </div>
      </nav> */}

      {/* <div className="flex items-center gap-2 text-sm font-light text-white/60 lg:hidden">
        <span>建议使用桌面端浏览器访问</span>
      </div> */}
    </div>
  )
}

export default MobilePage
