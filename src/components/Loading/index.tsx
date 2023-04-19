import style from './index.module.css'
import React from 'react'

export type LoadingProps = { message?: string }

const Loading: React.FC<LoadingProps> = ({ message }) => {
  return (
    <div className={style.overlay}>
      <div className={style['child-div']}>
        <div className={style['lds-dual-ring']}></div>
        <div>{message ? message : 'Loading'}</div>
      </div>
    </div>
  )
}

export default React.memo(Loading)
