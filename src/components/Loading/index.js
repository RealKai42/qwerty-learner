import React from 'react'
import style from './index.module.css'

const Loading = (props) => {
  const { message } = props
  return (
    <div className={style.overlay}>
      <div className={style['child-div']}>
        <div className={style['lds-dual-ring']}></div>
        <div>{message ? message : 'Loading'}</div>
      </div>
    </div>
  )
}

Loading.propTypes = {}

export default Loading
