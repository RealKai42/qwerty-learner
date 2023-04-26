import alipay from '@/assets/alipay.jpg'
import cnFlag from '@/assets/flags/cn.png'
import redBookLogo from '@/assets/redBook-black-logo.svg'
import redBookCode from '@/assets/redBook-code.jpg'
import vscLogo from '@/assets/vsc-logo.svg'
import weChat from '@/assets/weChat.jpg'
import InfoPanel from '@/components/InfoPanel'
import Tooltip from '@/components/Tooltip'
import { infoPanelStateAtom } from '@/store'
import { InfoPanelType } from '@/typings'
import { recordOpenInfoPanelAction } from '@/utils'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import { IconBrandWechat, IconCoffee, IconTerminal2 } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import React, { useCallback } from 'react'

const Footer: React.FC = () => {
  const [infoPanelState, setInfoPanelState] = useAtom(infoPanelStateAtom)

  const handleOpenInfoPanel = useCallback(
    (modalType: InfoPanelType) => {
      recordOpenInfoPanelAction(modalType, 'footer')
      setInfoPanelState((state) => ({ ...state, [modalType]: true }))
    },
    [setInfoPanelState],
  )

  const handleCloseInfoPanel = useCallback(
    (modalType: InfoPanelType) => {
      setInfoPanelState((state) => ({ ...state, [modalType]: false }))
    },
    [setInfoPanelState],
  )

  return (
    <>
      <InfoPanel
        openState={infoPanelState.donate}
        title="Buy us a coffee"
        icon={IconCoffee}
        buttonClassName="bg-yellow-500 hover:bg-yellow-400"
        iconClassName="bg-amber-100 text-amber-500"
        onClose={() => handleCloseInfoPanel('donate')}
      >
        <p className="text-sm text-gray-500 dark:text-gray-300">
          非常感谢大家使用 Qwerty Learner, 目前该网站使用业余时间在维护， 为了保证网站能够持续地提供给大家高质量的服务，我们需要您的帮助！
          <br />
          您的捐款将有助于我们支付网站的运营成本，改进网站的功能和设计，并提高用户体验。
          <br />
        </p>
        <br />
        <p className="text-sm text-gray-700 dark:text-gray-200">
          我们相信，共同的努力可以让 Qwerty Learner 成为更好的学习平台，也相信您的支持将给予我们持续前进的动力。 感谢您的支持！
        </p>
        <br />
        <div className="flex w-full justify-start">
          <img src={alipay} alt="alipay" className="mx-4 w-1/3" />
          <img src={weChat} alt="weChat" className="mx-4 w-1/3" />
        </div>
      </InfoPanel>

      <InfoPanel
        openState={infoPanelState.vsc}
        title="VSCode 摸🐟插件"
        icon={IconTerminal2}
        buttonClassName="bg-blue-500 hover:bg-blue-400"
        iconClassName="text-blue-600 bg-blue-300"
        onClose={() => handleCloseInfoPanel('vsc')}
      >
        <p className="text-sm text-gray-500  dark:text-gray-400">
          我们根据大家的建议开发了 VSCode 插件，支持一键启动，随时开始背单词。
          可以在任意文件中一键开启，开启后单词显示在状态栏中，且插件会拦截用户对文档的输入，不会影响到原始文档。
        </p>
        <br /> <br />
        <a className="mr-5 underline dark:text-gray-300" href="https://github.com/Kaiyiwing/qwerty-learner-vscode">
          GitHub 项目
        </a>
        <a className="underline dark:text-gray-300" href="https://marketplace.visualstudio.com/items?itemName=Kaiyi.qwerty-learner">
          VSCode 插件链接
        </a>
        <br />
      </InfoPanel>

      <InfoPanel
        openState={infoPanelState.community}
        title="用户反馈社群"
        icon={IconBrandWechat}
        buttonClassName="bg-cyan-500 hover:bg-cyan-400"
        iconClassName="text-cyan-600 bg-cyan-300"
        onClose={() => handleCloseInfoPanel('community')}
      >
        <p className="text-sm text-gray-500  dark:text-gray-400">
          Qwerty Learner 是一个开源项目，旨在为用户提供高质量、可靠的打字练习工具。
          <br />
          加入我们的用户社群后，您可以与我们的开发团队进行沟通，分享您的使用体验和建议，帮助我们改进产品，同时也能够及时了解我们的最新动态和更新内容。
          <br />
          <br />
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          我们深信，与用户的良好互动和反馈是推动我们不断前进和提高的重要因素。因此，我们诚挚邀请您加入我们的社群，与我们一起打造更好的
          「Qwerty Learner」！
        </p>
        <br />
        <p className="text-sm text-gray-500  dark:text-gray-400">再次感谢您的支持和关注！</p>
        <br />
        <img className="ml-1 w-2/6 " src="https://qwerty.kaiyi.cool/weChat-group.jpg" alt="weChat-group" />
        <br />
      </InfoPanel>

      <InfoPanel
        openState={infoPanelState.redBook}
        title="小红书社群"
        icon="redBookLogo"
        buttonClassName="bg-rose-500 hover:bg-red-400"
        iconClassName="bg-rose-300"
        onClose={() => handleCloseInfoPanel('redBook')}
      >
        <p className="text-sm text-gray-500  dark:text-gray-400">
          Qwerty Learner 是一个开源项目，旨在为用户提供高质量、可靠的打字练习工具。
          <br />
          关注小红书后，您可以获得开发团队的最新动态和更新内容，反馈您的使用体验和建议，帮助我们改进产品。
          <br />
          <br />
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          我们深信，与用户的良好互动和反馈是推动我们不断前进和提高的重要因素。因此，我们诚挚邀请您关注我们的小红书账号，与我们一起打造更好的
          「Qwerty Learner」！
        </p>
        <br />
        <br />
        <img className="ml-1 w-5/12 " src={redBookCode} alt="redBook" />
        <p className="text-sm text-gray-500  dark:text-gray-400">Tips: 从小红书“我”的左上角点击 三 找到 扫一扫</p>
        <br />
      </InfoPanel>

      <footer className="mb-1 mt-4 flex w-full items-center justify-center gap-2 text-sm ease-in" onClick={(e) => e.currentTarget.blur()}>
        <a href="https://github.com/Kaiyiwing/qwerty-learner" target="_blank" rel="noreferrer" aria-label="前往 GitHub 项目主页">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 496 512"
            className="h-4 w-4 fill-current text-gray-500 focus:outline-none dark:text-gray-400"
          >
            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
          </svg>
        </a>

        <button
          className="cursor-pointer"
          type="button"
          onClick={(e) => {
            handleOpenInfoPanel('redBook')
            e.currentTarget.blur()
          }}
          aria-label="加入我们的小红书社群"
        >
          <img src={redBookLogo} width={16} height={16} className="fill-current text-gray-500" alt="red book" />
        </button>

        <button
          className="cursor-pointer focus:outline-none "
          type="button"
          onClick={(e) => {
            handleOpenInfoPanel('community')
            e.currentTarget.blur()
          }}
          aria-label="加入我们的微信用户群"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            className="h-4 w-4 fill-current text-gray-500 focus:outline-none dark:text-gray-400"
          >
            <path d="M385.2 167.6c6.4 0 12.6.3 18.8 1.1C387.4 90.3 303.3 32 207.7 32 100.5 32 13 104.8 13 197.4c0 53.4 29.3 97.5 77.9 131.6l-19.3 58.6 68-34.1c24.4 4.8 43.8 9.7 68.2 9.7 6.2 0 12.1-.3 18.3-.8-4-12.9-6.2-26.6-6.2-40.8-.1-84.9 72.9-154 165.3-154zm-104.5-52.9c14.5 0 24.2 9.7 24.2 24.4 0 14.5-9.7 24.2-24.2 24.2-14.8 0-29.3-9.7-29.3-24.2.1-14.7 14.6-24.4 29.3-24.4zm-136.4 48.6c-14.5 0-29.3-9.7-29.3-24.2 0-14.8 14.8-24.4 29.3-24.4 14.8 0 24.4 9.7 24.4 24.4 0 14.6-9.6 24.2-24.4 24.2zM563 319.4c0-77.9-77.9-141.3-165.4-141.3-92.7 0-165.4 63.4-165.4 141.3S305 460.7 397.6 460.7c19.3 0 38.9-5.1 58.6-9.9l53.4 29.3-14.8-48.6C534 402.1 563 363.2 563 319.4zm-219.1-24.5c-9.7 0-19.3-9.7-19.3-19.6 0-9.7 9.7-19.3 19.3-19.3 14.8 0 24.4 9.7 24.4 19.3 0 10-9.7 19.6-24.4 19.6zm107.1 0c-9.7 0-19.3-9.7-19.3-19.6 0-9.7 9.7-19.3 19.3-19.3 14.5 0 24.4 9.7 24.4 19.3.1 10-9.9 19.6-24.4 19.6z" />
          </svg>
        </button>

        <button
          className="cursor-pointer focus:outline-none "
          type="button"
          onClick={(e) => {
            handleOpenInfoPanel('donate')
            e.currentTarget.blur()
          }}
          aria-label="考虑捐赠我们"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
            className="h-4 w-4 fill-current text-gray-500 focus:outline-none  dark:text-gray-400"
          >
            <path d="M96 64c0-17.7 14.3-32 32-32H448h64c70.7 0 128 57.3 128 128s-57.3 128-128 128H480c0 53-43 96-96 96H192c-53 0-96-43-96-96V64zM480 224h32c35.3 0 64-28.7 64-64s-28.7-64-64-64H480V224zM32 416H544c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
          </svg>
        </button>

        <button
          className="cursor-pointer focus:outline-none"
          type="button"
          onClick={(e) => {
            handleOpenInfoPanel('vsc')
            e.currentTarget.blur()
          }}
          aria-label="使用 Visual Studio Code 插件版 Qwerty Learner"
        >
          <img src={vscLogo} width={14} height={14} className="fill-current text-gray-500" alt="Visual Studio Code" />
        </button>

        <a
          href="mailto:me@kaiyi.cool"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.currentTarget.blur()}
          aria-label="发送邮件到 me@kaiyi.cool"
        >
          <EnvelopeIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </a>

        <Tooltip content="中国大陆镜像">
          <a href="https://kaiyiwing.gitee.io/qwerty-learner" target="_self" title="前往中国大陆镜像">
            <img src={cnFlag} className="h-5 w-5 cursor-pointer" alt="中国国旗" />
          </a>
        </Tooltip>

        <button
          className="cursor-pointer text-gray-500 no-underline hover:no-underline dark:text-gray-400 "
          type="button"
          onClick={(e) => {
            handleOpenInfoPanel('donate')
            e.currentTarget.blur()
          }}
        >
          @ Qwerty Learner
        </button>
        <a
          className="cursor-pointer text-gray-500 no-underline hover:no-underline dark:text-gray-400"
          href="https://beian.miit.gov.cn"
          target="_blank"
          rel="noreferrer"
        >
          鲁ICP备2022030649号
        </a>
        <span className="select-none rounded bg-slate-200 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Build <span className="select-all">{LATEST_COMMIT_HASH}</span>
        </span>
      </footer>
    </>
  )
}

export default Footer
