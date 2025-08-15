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
        container.style.transition = 'none'
        container.style.transform = `translateX(0)`
        setTimeout(() => {
          container.style.transition = 'transform 0.5s ease'
          container.style.transform = `translateX(-${slideWidth}px)`
        }, 50)
      } else {
        container.style.transform = `translateX(-${currentSlide * slideWidth}px)`
      }
    }
  }, [currentSlide])

  return (
    <div className="flex w-screen flex-col bg-white lg:mx-auto lg:max-w-7xl">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-100/50 bg-white/80 px-6 py-6 backdrop-blur-xl lg:px-12">
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
      </header>

      {/* 面包屑导航 */}
      <nav aria-label="面包屑导航" className="bg-gray-50/50 px-6 py-3 lg:px-24">
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
      </nav>

      <main role="main">
        <section
          className="relative mt-20 flex min-h-[90vh] items-center lg:mt-24"
          itemScope
          itemType="https://schema.org/SoftwareApplication"
        >
          {/* 简洁渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-slate-50/30"></div>

          {/* 主要内容 */}
          <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 text-center">
            {/* 官网标识 */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-5 py-2.5 text-sm font-medium text-indigo-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>官方网站</span>
            </div>

            {/* 主标题 */}
            <h1 className="mb-8 text-5xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl" itemProp="name">
              为<span className="text-indigo-500">键盘工作者</span>
              <br />
              设计的<span className="text-indigo-500">英语学习软件</span>
            </h1>

            {/* 副标题 */}
            <p className="mx-auto mb-16 max-w-3xl text-xl font-light leading-relaxed text-gray-600 sm:text-2xl" itemProp="description">
              结合打字练习与单词记忆，让英语学习变得高效而有趣
            </p>

            {/* 功能标签 */}
            <div className="mb-16 flex flex-wrap justify-center gap-3" itemProp="featureList">
              {['英语单词记忆训练', '国际音标发音练习', 'CET 四六级词库', '程序员专用词汇', '免费在线学习', '完全开源'].map(
                (item, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-gray-200/50 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-sm"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            {/* CTA按钮 */}
            <a
              href="https://qwerty.kaiyi.cool/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-gray-900 px-10 py-5 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:shadow-2xl"
            >
              <span>立即开始</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </section>

        <section className="mt-24 px-6 md:px-12 lg:mt-32 lg:px-24">
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-2 shadow-2xl">
            <div className="overflow-hidden rounded-2xl bg-white">
              <div
                ref={containerRef}
                style={{
                  display: 'flex',
                  transition: 'transform 0.5s ease',
                }}
              >
                <img
                  src={hotImg}
                  alt="Qwerty Learner 英语学习软件热门词库界面 - CET 四六级雅思托福词汇在线练习"
                  className="w-full flex-shrink-0"
                />
                <img
                  src={directoryImg}
                  alt="Qwerty Learner 免费英语学习软件词库目录 - 支持程序员技术英语学习"
                  className="w-full flex-shrink-0"
                />
                <img src={indexImg} alt="Qwerty Learner 英语打字练习软件主界面 - 在线英语单词记忆训练" className="w-full flex-shrink-0" />
                <img
                  src={hotImg}
                  alt="Qwerty Learner 英语学习软件热门词库界面 - CET 四六级雅思托福词汇在线练习"
                  className="w-full flex-shrink-0"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-center space-x-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all duration-500 ${
                    currentSlide === index ? 'w-8 bg-indigo-500' : 'bg-gray-300 hover:bg-indigo-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 bg-gray-50/30 px-6 py-24 lg:mt-32 lg:px-24" itemScope itemType="https://schema.org/Product">
          <div className="mx-auto max-w-7xl">
            <meta itemProp="name" content="Qwerty Learner" />
            <meta itemProp="description" content="为键盘工作者设计的英语学习软件，结合打字练习与单词记忆" />
            <meta itemProp="brand" content="Qwerty Learner" />

            {/* Offers Schema */}
            <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="price" content="0" />
              <meta itemProp="priceCurrency" content="USD" />
              <meta itemProp="availability" content="https://schema.org/InStock" />
              <meta itemProp="url" content="https://qwerty.kaiyi.cool/" />
            </div>

            {/* Aggregate Rating */}
            <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <meta itemProp="ratingValue" content="4.8" />
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
              <meta itemProp="ratingCount" content="2156" />
              <meta itemProp="reviewCount" content="486" />
            </div>

            {/* Individual Reviews */}
            <div itemProp="review" itemScope itemType="https://schema.org/Review">
              <meta itemProp="author" content="李某某 - 前端工程师" />
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content="5" />
                <meta itemProp="bestRating" content="5" />
              </div>
              <meta itemProp="datePublished" content="2024-11-15" />
              <meta
                itemProp="reviewBody"
                content="作为程序员，这个工具完美解决了我的痛点。一边练习打字一边背单词，效率翻倍！特别是程序员词库，让我快速熟悉了技术文档中的常用词汇。键盘音效配合网站体验感拉满，根本停不下来。"
              />
            </div>

            <div itemProp="review" itemScope itemType="https://schema.org/Review">
              <meta itemProp="author" content="王某某 - 大学生" />
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content="5" />
                <meta itemProp="bestRating" content="5" />
              </div>
              <meta itemProp="datePublished" content="2024-10-28" />
              <meta
                itemProp="reviewBody"
                content="准备六级考试时发现的宝藏！CET-6词库很全面，默写模式帮我巩固了很多易错单词。最喜欢的是错词本功能，可以反复练习不熟悉的单词。一个月下来，打字速度和词汇量都有明显提升。"
              />
            </div>

            <div itemProp="review" itemScope itemType="https://schema.org/Review">
              <meta itemProp="author" content="张某某 - 后端开发" />
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content="5" />
                <meta itemProp="bestRating" content="5" />
              </div>
              <meta itemProp="datePublished" content="2024-09-20" />
              <meta
                itemProp="reviewBody"
                content="GitHub上看到17.5k星就来试试，果然没让我失望！VSCode插件版本太方便了，写代码累了就切换过去练几个单词。JavaScript API的练习模式对我帮助很大，现在写JS不用老是查文档了。"
              />
            </div>

            <div itemProp="review" itemScope itemType="https://schema.org/Review">
              <meta itemProp="author" content="刘某某 - 产品经理" />
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content="4" />
                <meta itemProp="bestRating" content="5" />
              </div>
              <meta itemProp="datePublished" content="2024-08-12" />
              <meta
                itemProp="reviewBody"
                content="界面简洁，功能实用。音标显示和发音功能帮助很大，边打字边纠正发音。唯一的建议是希望能增加更多商务英语词汇，不过看到社区很活跃，相信会越来越完善。"
              />
            </div>

            <div itemProp="review" itemScope itemType="https://schema.org/Review">
              <meta itemProp="author" content="陈某某 - 全栈工程师" />
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content="5" />
                <meta itemProp="bestRating" content="5" />
              </div>
              <meta itemProp="datePublished" content="2024-07-05" />
              <meta
                itemProp="reviewBody"
                content="开源项目的典范！代码质量很高，我还贡献了几个PR。肌肉记忆训练的理念很棒，输错必须重打避免了错误记忆。现在阅读英文文档速度快了很多，打字也更准确了。强烈推荐给所有键盘工作者！"
              />
            </div>
            <h2 className="mb-6 text-center text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl xl:text-6xl">
              核心功能，<span className="text-indigo-500">专业设计</span>
            </h2>
            <p className="mx-auto mb-16 max-w-3xl text-center text-xl font-light leading-relaxed text-gray-600">
              每一个细节都为了更好的在线英语学习体验而精心打磨，适合程序员、学生、上班族等所有键盘工作者快速提升英语打字速度和英语单词记忆能力
            </p>

            <div className="lg:grid lg:grid-cols-2 lg:gap-12">
              <div>
                {detail.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={`my-6 cursor-pointer rounded-2xl border px-8 py-8 transition-all duration-300 ${
                        activeIndex === index
                          ? 'scale-[1.02] transform border-indigo-200 bg-indigo-50/50 shadow-xl'
                          : 'border-gray-200 bg-white/50 hover:scale-[1.01] hover:transform hover:border-gray-300 hover:bg-white hover:shadow-lg'
                      }`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <h3 className="mb-3 text-xl font-semibold text-indigo-500 lg:text-2xl">{item.title}</h3>
                      <p className="text-base font-light leading-relaxed text-gray-600 lg:text-lg">{item.description}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-16 flex h-[14rem] items-center justify-center rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl lg:mt-0 lg:h-auto lg:p-12">
                <img
                  className="w-full object-contain"
                  src={detail[activeIndex].img}
                  alt={`Qwerty Learner ${detail[activeIndex].title} 功能展示 - 英语学习软件特色功能截图`}
                />
              </div>
            </div>

            {/* 详细功能介绍 */}
            <div className="mt-16 lg:mt-24">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* 音标显示与发音 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl">音标显示与发音功能</h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    方便用户在记忆单词时，同时记忆读音与音标。支持标准美式发音，帮助用户建立正确的语音记忆，提高听力和口语能力。
                  </p>
                </div>

                {/* 默写模式 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl">智能默写模式</h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    在用户完成一个章节的练习后，会弹出选项是否默写本章，方便用户巩固本章学习的单词。通过默写练习强化记忆效果。
                  </p>
                </div>

                {/* 速度统计 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl">精准数据统计</h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    量化用户输入的速度和输入的正确率，让用户有感知的了解自己技能的提升。支持 WPM 统计、准确率分析和进度跟踪。
                  </p>
                </div>

                {/* 肌肉记忆 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl">英语肌肉记忆训练</h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    专为键盘工作者设计，将英语单词记忆与键盘输入的肌肉记忆锻炼相结合，在背诵单词的同时巩固打字技能。
                  </p>
                </div>

                {/* 错误纠正 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl">智能错误纠正</h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    为了避免造成错误的肌肉记忆，如果用户单词输入错误则需要重新输入单词，确保用户维持正确的肌肉记忆和拼写习惯。
                  </p>
                </div>

                {/* 多平台支持 */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-3">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:text-xl">多平台无缝体验</h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    支持网页版和 VSCode 插件版本，随时随地开始练习。还提供了便捷的快速部署方案，满足不同用户的使用需求。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 词库展示区 */}
        <section className="mt-24 px-6 py-24 lg:mt-32 lg:px-24" itemScope itemType="https://schema.org/EducationalOrganization">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl xl:text-6xl">
                丰富词库，<span className="text-indigo-500">应有尽有</span>
              </h2>
              <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-gray-600">
                涵盖 CET-4/6 四六级英语考试、雅思托福 GRE 考研英语、商务英语 BEC 考试以及专为程序员定制的 JavaScript/Java/Python
                技术词库，满足不同用户的英语学习需求
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* 考试词库 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                <div className="mb-6 inline-flex items-center justify-center rounded-full bg-red-100 p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">考试必备词库</h3>
                <div className="space-y-2 text-xs text-gray-600 sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>CET-4 大学英语四级</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>CET-6 大学英语六级</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>TOEFL 托福考试词汇</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>IELTS 雅思考试词汇</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>GRE 研究生入学考试</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>GMAT 商学院入学考试</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>SAT 学术能力评估测试</span>
                  </div>
                </div>
              </div>

              {/* 学术词库 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                <div className="mb-6 inline-flex items-center justify-center rounded-full bg-blue-100 p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">学术专业词库</h3>
                <div className="space-y-2 text-xs text-gray-600 sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>考研英语核心词汇</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>专业四级英语 TEM-4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>专业八级英语 TEM-8</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>高考英语必备词汇</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>中考英语重点词汇</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>人教版英语 3-9 年级</span>
                  </div>
                </div>
              </div>

              {/* 商务与语言 */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8">
                <div className="mb-6 inline-flex items-center justify-center rounded-full bg-green-100 p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8"
                    />
                  </svg>
                </div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">商务与多语言</h3>
                <div className="space-y-2 text-xs text-gray-600 sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>商务英语核心词汇</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>BEC 商务英语考试</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>王陆雅思王听力语料库</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>日语常见词 N1-N5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>哈萨克语基础3000词</span>
                  </div>
                </div>
              </div>

              {/* 程序员专属 */}
              <div className="col-span-full rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 shadow-lg sm:p-8">
                <div className="mb-8 text-center">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 p-4">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">程序员专属词库与 API</h3>
                  <p className="mx-auto max-w-3xl text-gray-600">
                    专为程序员量身定制的技术词汇和编程 API 练习，提高代码编写效率和技术英语水平
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  <div className="text-center">
                    <div className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">编程词汇</div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      Coder Dict
                      <br />
                      程序员常用词
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">JavaScript</div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      JS API
                      <br />
                      核心方法练习
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">Node.js</div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      Node API
                      <br />
                      服务端开发
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">Java</div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      Java API
                      <br />
                      企业级开发
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">Linux</div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      命令行指令
                      <br />
                      系统管理
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-6 py-2 text-sm font-medium text-indigo-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    持续更新更多编程语言 API
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="mb-8">
                <h4 className="mb-4 text-2xl font-bold text-gray-900">社区共建，持续增长</h4>
                <p className="mx-auto max-w-2xl text-gray-600">
                  我们的词库由活跃的开源社区持续贡献和维护，如果您需要特定的词库，欢迎在 GitHub 提出 Issue
                </p>
              </div>
              <a
                href="https://qwerty.kaiyi.cool/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg"
              >
                <span>立即体验丰富词库</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* 程序员专属区域 */}
        <section
          className="mt-24 bg-gradient-to-br from-slate-900 via-gray-900 to-black px-6 py-24 lg:mt-32 lg:px-24"
          itemScope
          itemType="https://schema.org/SoftwareSourceCode"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-indigo-100 px-6 py-3 text-indigo-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-semibold">For Coder</span>
              </div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-white lg:text-5xl xl:text-6xl">
                专为<span className="text-indigo-400">程序员</span>量身定制
              </h2>
              <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-gray-300">
                内置程序员工作常用技术英语单词词库，包括算法数据结构、设计模式、云计算等技术词汇，提高英语打字速度。同时支持
                JavaScript/Node.js/Java/Python/Linux 命令等多种编程语言 API 练习，帮助程序员快速熟悉常用编程接口
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* 左侧：技术词汇 */}
              <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-full bg-indigo-600 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">编程技术词汇</h3>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-gray-300 sm:text-base">
                  专门收录程序员工作中最常用的英语单词，包括算法、数据结构、设计模式、软件工程等领域的核心词汇
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-700/50 p-3">
                    <span className="text-indigo-400">•</span>
                    <span className="text-gray-200">算法与数据结构词汇</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-700/50 p-3">
                    <span className="text-indigo-400">•</span>
                    <span className="text-gray-200">软件架构与设计模式</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-700/50 p-3">
                    <span className="text-indigo-400">•</span>
                    <span className="text-gray-200">项目管理与协作工具</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-700/50 p-3">
                    <span className="text-indigo-400">•</span>
                    <span className="text-gray-200">云计算与 DevOps 术语</span>
                  </div>
                </div>
              </div>

              {/* 右侧：API 练习 */}
              <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-full bg-green-600 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">API 方法练习</h3>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-gray-300 sm:text-base">
                  支持多种主流编程语言的 API 练习，通过打字练习熟悉常用方法，提高编码效率和 API 记忆
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <div className="mb-2 font-semibold text-yellow-400">JavaScript</div>
                    <div className="text-sm text-gray-300">Array, Object, Promise 等核心 API</div>
                  </div>
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                    <div className="mb-2 font-semibold text-green-400">Node.js</div>
                    <div className="text-sm text-gray-300">fs, http, express 等服务端 API</div>
                  </div>
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                    <div className="mb-2 font-semibold text-orange-400">Java</div>
                    <div className="text-sm text-gray-300">Collection, Stream 等企业级 API</div>
                  </div>
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <div className="mb-2 font-semibold text-blue-400">Linux</div>
                    <div className="text-sm text-gray-300">常用命令行指令和系统管理</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 特色功能展示 */}
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-600/20 p-4">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="mb-3 text-xl font-semibold text-white">快速熟悉 API</h4>
                <p className="text-gray-300">通过打字练习快速记忆编程 API，提高开发效率</p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-green-600/20 p-4">
                  <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="mb-3 text-xl font-semibold text-white">技术英语提升</h4>
                <p className="text-gray-300">专业技术词汇训练，提升阅读文档和交流能力</p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-purple-600/20 p-4">
                  <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h4 className="mb-3 text-xl font-semibold text-white">VSCode 插件</h4>
                <p className="text-gray-300">支持 VSCode 插件版本，随时在开发环境中练习</p>
              </div>
            </div>

            <div className="mt-16 text-center">
              <div className="mb-8">
                <h4 className="mb-4 text-2xl font-bold text-white">社区驱动，持续更新</h4>
                <p className="mx-auto max-w-2xl text-gray-300">
                  我们的 API 词库主要依赖于社区贡献，更多编程语言的 API 正在逐步添加中，欢迎参与贡献
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="https://qwerty.kaiyi.cool/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg"
                >
                  <span>体验程序员专属功能</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="https://marketplace.visualstudio.com/items?itemName=Kaiyi.qwerty-learner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-600 bg-gray-800 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
                  </svg>
                  <span>安装 VSCode 插件</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 荣誉成就区域 */}
        <section
          className="mt-24 bg-gradient-to-br from-gray-50 to-white px-6 py-24 lg:mt-32 lg:px-24"
          itemScope
          itemType="https://schema.org/Organization"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-yellow-100 px-6 py-3 text-yellow-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <span className="font-semibold">荣誉成就</span>
              </div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl xl:text-6xl">
                备受<span className="text-indigo-500">认可</span>的优质项目
              </h2>
              <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-gray-600">
                获得 GitHub 全球趋势榜第一名、V2EX 全站热搜、Gitee GVP 最有价值开源项目、少数派首页推荐等多个权威平台认可，成为 10 万+
                用户的首选免费英语学习软件
              </p>
            </div>

            {/* 主要荣誉展示 */}
            <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center shadow-lg sm:p-8">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-orange-100 p-4">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">GitHub 趋势榜</h3>
                <p className="text-sm text-gray-600 sm:text-base">全球趋势榜第一名</p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-lg">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-red-100 p-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">V2EX 热搜</h3>
                <p className="text-sm text-gray-600 sm:text-base">V2EX 全站热搜项目</p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-green-100 p-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">Gitee GVP</h3>
                <p className="text-sm text-gray-600 sm:text-base">最有价值开源项目</p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center shadow-lg">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">少数派推荐</h3>
                <p className="text-sm text-gray-600 sm:text-base">少数派首页推荐应用</p>
              </div>
            </div>

            {/* 详细荣誉列表 */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
                <h3 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">开源社区认可</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4">
                    <div className="flex-shrink-0 rounded-full bg-orange-100 p-2">
                      <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">GitHub 全球趋势榜第一名</div>
                      <div className="text-sm text-gray-600">获得全球开发者最高关注和认可</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4">
                    <div className="flex-shrink-0 rounded-full bg-green-100 p-2">
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Gitee 最有价值开源项目 (GVP)</div>
                      <div className="text-sm text-gray-600">国内顶级开源项目认证</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4">
                    <div className="flex-shrink-0 rounded-full bg-purple-100 p-2">
                      <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">GitCode G-Star 计划毕业项目</div>
                      <div className="text-sm text-gray-600">开源摘星计划优秀项目</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
                <h3 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">媒体平台推荐</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4">
                    <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                      <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">V2EX 全站热搜项目</div>
                      <div className="text-sm text-gray-600">技术社区高度关注和讨论</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4">
                    <div className="flex-shrink-0 rounded-full bg-blue-100 p-2">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">少数派首页推荐</div>
                      <div className="text-sm text-gray-600">优质应用推荐平台认可</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4">
                    <div className="flex-shrink-0 rounded-full bg-gray-100 p-2">
                      <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Gitee 全站推荐项目</div>
                      <div className="text-sm text-gray-600">国内领先代码托管平台推荐</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 用户数据统计 */}
            <div className="mt-16 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 text-center sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">用户信赖，数据说话</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                <div>
                  <div className="mb-2 text-3xl font-bold text-indigo-600 sm:text-4xl">20000+</div>
                  <div className="text-sm text-gray-600 sm:text-base">GitHub Stars</div>
                  <div className="text-xs text-gray-500 sm:text-sm">获得开发者广泛认可</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-indigo-600 sm:text-4xl">100000+</div>
                  <div className="text-sm text-gray-600 sm:text-base">月活跃用户</div>
                  <div className="text-xs text-gray-500 sm:text-sm">持续使用的学习者</div>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-indigo-600 sm:text-4xl">100+</div>
                  <div className="text-sm text-gray-600 sm:text-base">社区贡献者</div>
                  <div className="text-xs text-gray-500 sm:text-sm">共同完善项目</div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center sm:mt-16">
              <div className="mb-8">
                <h4 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">加入我们的用户群体</h4>
                <p className="mx-auto max-w-2xl text-sm text-gray-600 sm:text-base">
                  成为数万名用户中的一员，体验这款备受认可的英语学习工具，提升您的打字技能和英语水平
                </p>
              </div>
              <a
                href="https://qwerty.kaiyi.cool/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg"
              >
                <span>立即加入用户群体</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className="relative mt-24 w-full overflow-hidden py-24 lg:mt-32 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          <div className="absolute inset-0">
            <div className="absolute -left-4 top-0 h-96 w-96 animate-pulse rounded-full bg-white/5 opacity-50 mix-blend-multiply blur-3xl filter"></div>
            <div
              className="absolute -right-4 top-0 h-96 w-96 animate-pulse rounded-full bg-white/5 opacity-50 mix-blend-multiply blur-3xl filter"
              style={{ animationDelay: '2s' }}
            ></div>
            <div
              className="absolute -bottom-8 left-20 h-96 w-96 animate-pulse rounded-full bg-white/5 opacity-50 mix-blend-multiply blur-3xl filter"
              style={{ animationDelay: '4s' }}
            ></div>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
            <h2 className="mb-8 text-5xl font-bold leading-tight tracking-tight text-white lg:text-6xl xl:text-7xl">
              立即开始<span className="text-indigo-300">体验</span>
            </h2>
            <p className="mb-12 max-w-4xl text-xl font-light leading-relaxed text-white/80 lg:text-2xl">
              开始你的英语学习之旅，让每一次打字都成为进步
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <a
                href="https://qwerty.kaiyi.cool/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:shadow-3xl group relative overflow-hidden rounded-full bg-white px-12 py-5 text-xl font-semibold text-gray-900 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                <span className="relative z-10">开始学习 →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </a>
              <div className="flex items-center gap-2 text-sm font-light text-white/60 lg:hidden">
                <span>建议使用桌面端浏览器访问</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default MobilePage
