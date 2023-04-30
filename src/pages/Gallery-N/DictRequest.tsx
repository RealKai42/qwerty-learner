import InfoPanel from '@/components/InfoPanel'
import { useCallback, useState } from 'react'
import IconBook2 from '~icons/tabler/book-2'

export default function DictRequest() {
  const [showPanel, setShowPanel] = useState(false)

  const onOpenPanel = useCallback(() => {
    setShowPanel(true)
  }, [])

  const onClosePanel = useCallback(() => {
    setShowPanel(false)
  }, [])

  return (
    <>
      {showPanel && (
        <InfoPanel
          openState={showPanel}
          title="申请词典"
          icon={IconBook2}
          buttonClassName="bg-indigo-500 hover:bg-indigo-400"
          iconClassName="text-indigo-500 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-500"
          onClose={onClosePanel}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            如果您有相关的编程基础，可以参考
            <a
              href="https://github.com/Kaiyiwing/qwerty-learner/blob/master/docs/toBuildDict.md"
              className="px-2 text-blue-500"
              target="_blank"
              rel="noreferrer"
            >
              导入词典
            </a>
            ，给项目贡献新的词典。
            <br />
            <br />
            如果您没有相关的编程基础，可以将您的字典需求发送邮件到{' '}
            <a href="mailto:me@kaiyi.cool" className="px-2 text-blue-500" aria-label="发送邮件到 me@kaiyi.cool">
              me@kaiyi.cool
            </a>
            ，或者在网页底部添加我们的用户社群进行反馈。
          </p>
          <br />
        </InfoPanel>
      )}
      <button className="cursor-pointer pr-6 text-sm text-indigo-500" onClick={onOpenPanel}>
        没有找到想要的词典？
      </button>
    </>
  )
}
