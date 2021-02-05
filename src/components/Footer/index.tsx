import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Footer: React.FC = () => {
  return (
    <div className="w-full text-sm text-center pb-1 ease-in" onClick={(e) => e.currentTarget.blur()}>
      <a href="https://github.com/Kaiyiwing/qwerty-learner">
        <FontAwesomeIcon icon={['fab', 'github']} className="text-gray-500 mr-3" />
      </a>
      <a href="mailto:ZHANG.Kaiyi42@gmail.com" onClick={(e) => e.currentTarget.blur()}>
        <FontAwesomeIcon icon={['fas', 'envelope']} className="text-gray-500 mr-3" />
      </a>

      <a className="text-gray-500 no-underline hover:no-underline" href="#/" onClick={(e) => e.currentTarget.blur()}>
        @ Qwerty Learner
      </a>
    </div>
  )
}

export default React.memo(Footer)
