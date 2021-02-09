import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Donate from 'components/Donate'

const Footer: React.FC = () => {
  const [showDonate, setShowDonate] = useState<boolean>(false)
  return (
    <>
      {showDonate && <Donate state={showDonate} buttonOnclick={() => setShowDonate(false)} />}
      <div className="w-full text-sm text-center mt-4 pb-1 ease-in" onClick={(e) => e.currentTarget.blur()}>
        <a href="https://github.com/Kaiyiwing/qwerty-learner">
          <FontAwesomeIcon icon={['fab', 'github']} className="text-gray-500 dark:text-gray-400 mr-3" />
        </a>

        <span
          className="cursor-pointer"
          onClick={(e) => {
            setShowDonate(true)
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={['fas', 'coffee']} className="text-gray-500 dark:text-gray-400 mr-3" />
        </span>

        <a href="mailto:ZHANG.Kaiyi42@gmail.com" onClick={(e) => e.currentTarget.blur()}>
          <FontAwesomeIcon icon={['fas', 'envelope']} className="text-gray-500 dark:text-gray-400 mr-3" />
        </a>

        <div className="group relative inline-block ">
          <a href="https://kaiyiwing.gitee.io/qwerty-learner/" className="text-gray-500 dark:text-gray-400 mr-3" title="中国大陆节点">
            🇨🇳
          </a>
          <div className="invisible group-hover:visible absolute bottom-full left-1/2 w-40 -ml-20 pt-2 flex items-center justify-center">
            <span className="py-1 px-3 text-gray-500 dark:text-gray-400 text-xs">中国大陆镜像</span>
          </div>
        </div>
        <span
          className="text-gray-500 dark:text-gray-400 cursor-pointer no-underline hover:no-underline "
          onClick={(e) => {
            setShowDonate(true)
            e.currentTarget.blur()
          }}
        >
          @ Qwerty Learner
        </span>
      </div>
    </>
  )
}

export default React.memo(Footer)
