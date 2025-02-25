import Layout from '../../components/Layout'
import ezbdc from '@/assets/friendlinks/ezbdc.jpg'
import kk from '@/assets/friendlinks/kk.jpg'
import web_worker from '@/assets/friendlinks/web-worker.png'
import type React from 'react'
import { useNavigate } from 'react-router-dom'
import IconX from '~icons/tabler/x'

export const FriendLinks: React.FC = () => {
  const navigate = useNavigate()

  const links = [
    {
      title: 'ez背单词',
      href: 'https://ezbdc.dashu.ai',
      imgSrc: ezbdc,
      description: '一款极简的英文单词学习应用，可以非常方便高效地学习英文，具有有挑战性的单词背诵模式，无需注册，下载即用',
    },
    {
      title: 'Kai',
      href: 'https://kaiyi.cool/',
      imgSrc: kk,
      description: 'Kai 的个人博客，记录了一些技术文章，生活感悟，以及一些有趣的小项目',
    },
    {
      title: 'Web Worker-前端程序员都爱听',
      href: 'https://www.xiaoyuzhoufm.com/podcast/613753ef23c82a9a1ccfdf35',
      imgSrc: web_worker,
      description:
        'Web Worker 播客是几个前端程序员闲聊的前端中文音频播客节目。节目围绕程序员领域瞎聊，聊资讯、聊职场、聊技术选型……只要是和 web 开发有关的都可以聊。',
    },
  ]

  const onBack = () => {
    navigate('/')
  }

  return (
    <Layout>
      <div className="fixed top-0 z-20 flex h-14 w-full flex-row-reverse items-center sm:h-16">
        <IconX className="mx-4 h-7 w-7 cursor-pointer text-gray-400 sm:mx-6" onClick={onBack} />
      </div>

      <div className="flex w-full flex-1 flex-col items-center px-4 pt-20">
        <div className="flex w-full max-w-md flex-grow flex-col items-center">
          <div className="mt-5 text-center text-lg font-bold dark:text-gray-50">友情链接</div>
          <div className="links flex w-full flex-col items-center gap-y-8 py-5">
            {links.map((link, index) => (
              <a
                key={index}
                title={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="linkItem flex w-full items-center overflow-hidden dark:text-gray-50"
              >
                <div className="mr-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border bg-gray-200">
                  <img src={link.imgSrc} alt={link.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="pb-1 text-sm font-bold dark:text-white">{link.title}</div>
                  <div className="text-xs text-gray-500">{link.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="mt-auto pb-5 text-center text-sm text-gray-500">
          想要添加友链？请联系邮箱：
          <a href="mailto:me@kaiyi.cool" className="text-blue-500">
            me@kaiyi.cool
          </a>
        </div>
      </div>
    </Layout>
  )
}
