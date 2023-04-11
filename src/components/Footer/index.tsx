import React, { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import InfoPanel from '@/components/InfoPanel'
import alipay from '@/assets/alipay.png'
import weChat from '@/assets/weChat.png'
import vscLogo from '@/assets/vsc-logo.svg'
import { recordOpenInfoPanelAction } from '@/utils'
import { InfoPanelType } from '@/typings'
import { useAtom } from 'jotai'
import { infoPanelStateAtom } from '@/store'
import redBookLogo from '@/assets/redBook-black-logo.svg'
import redBookCode from '@/assets/redBook-code.png'

const Footer: React.FC = () => {
  const [infoPanelState, setInfoPanelState] = useAtom(infoPanelStateAtom)

  const handleOpenInfoPanel = useCallback(
    (modalType: InfoPanelType) => {
      recordOpenInfoPanelAction(modalType, 'footer')
      setInfoPanelState((state) => {
        return {
          ...state,
          [modalType]: true,
        }
      })
    },
    [setInfoPanelState],
  )

  const handleCloseInfoPanel = useCallback(
    (modalType: InfoPanelType) => {
      setInfoPanelState((state) => {
        return {
          ...state,
          [modalType]: false,
        }
      })
    },
    [setInfoPanelState],
  )

  return (
    <>
      {infoPanelState.donate && (
        <InfoPanel
          openState={infoPanelState.donate}
          title="Buy us a coffee"
          icon="coffee"
          btnColor="bg-yellow-300"
          iconColor="text-yellow-500"
          iconBackgroundColor="bg-yellow-100"
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
      )}
      {infoPanelState.vsc && (
        <InfoPanel
          openState={infoPanelState.vsc}
          title="VSCode 摸🐟插件"
          icon="terminal"
          btnColor="bg-blue-400"
          iconColor="text-blue-600"
          iconBackgroundColor="bg-blue-300"
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
      )}
      {infoPanelState.community && (
        <InfoPanel
          openState={infoPanelState.community}
          title="用户反馈社群"
          icon={['fab', 'weixin']}
          btnColor="bg-cyan-400"
          iconColor="text-cyan-600"
          iconBackgroundColor="bg-cyan-300"
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
          <img className="ml-1 w-2/6 " src="https://qwerty.kaiyi.cool/weChat-group" alt="weChat-group" />
          <br />
        </InfoPanel>
      )}
      {infoPanelState.redBook && (
        <InfoPanel
          openState={infoPanelState.redBook}
          title="小红书社群"
          icon="redBookLogo"
          btnColor="bg-rose-500"
          iconColor="#ff2e4d"
          iconBackgroundColor="bg-rose-300"
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
      )}

      <footer className="mt-4 w-full pb-1 text-center text-sm ease-in" onClick={(e) => e.currentTarget.blur()}>
        <a href="https://github.com/Kaiyiwing/qwerty-learner" target="_blank" rel="noreferrer">
          <FontAwesomeIcon icon={['fab', 'github']} className="mr-3 text-gray-500 dark:text-gray-400" />
        </a>
        <span
          className="mr-3 cursor-pointer"
          onClick={(e) => {
            handleOpenInfoPanel('redBook')
            e.currentTarget.blur()
          }}
        >
          <img src={redBookLogo} className="svg-inline--fa fill-current text-gray-500" alt="red book" style={{ fill: '#6B7280' }} />
        </span>
        <span
          className="cursor-pointer"
          onClick={(e) => {
            handleOpenInfoPanel('community')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={['fab', 'weixin']} className="mr-3 text-gray-500 dark:text-gray-400" />
        </span>

        <span
          className="cursor-pointer"
          onClick={(e) => {
            handleOpenInfoPanel('donate')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={['fas', 'coffee']} className="mr-3 text-gray-500 dark:text-gray-400" />
        </span>

        <span
          className="mr-3 cursor-pointer"
          onClick={(e) => {
            handleOpenInfoPanel('vsc')
            e.currentTarget.blur()
          }}
        >
          <img src={vscLogo} className="svg-inline--fa fill-current text-gray-500" alt="visual studio code" />
        </span>

        <a href="mailto:me@kaiyi.cool" target="_blank" rel="noreferrer" onClick={(e) => e.currentTarget.blur()}>
          <FontAwesomeIcon icon={['fas', 'envelope']} className="mr-3 text-gray-500 dark:text-gray-400" />
        </a>

        <div className="group relative inline-block ">
          <a href="https://kaiyiwing.gitee.io/qwerty-learner/" className="mr-3 text-gray-500 dark:text-gray-400" title="中国大陆节点">
            🇨🇳
          </a>
          <div className="invisible absolute bottom-full left-1/2 -ml-20 flex w-40 items-center justify-center pt-2 group-hover:visible">
            <span className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">中国大陆镜像</span>
          </div>
        </div>
        <span
          className="cursor-pointer text-gray-500 no-underline hover:no-underline dark:text-gray-400 "
          onClick={(e) => {
            handleOpenInfoPanel('donate')
            e.currentTarget.blur()
          }}
        >
          @ Qwerty Learner
        </span>
        <a
          className="cursor-pointer pl-2 text-gray-500 no-underline hover:no-underline dark:text-gray-400"
          href="https://beian.miit.gov.cn"
          target="_blank"
          rel="noreferrer"
        >
          鲁ICP备2022030649号
        </a>
      </footer>
    </>
  )
}

export default Footer
