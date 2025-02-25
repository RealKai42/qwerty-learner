import type React from 'react'

const Flow: React.FC = () => {
  const waveStyle = {
    animation: 'move 3s linear infinite both',
  }

  return (
    <div className="h-[15rem] w-full">
      <svg className="h-full w-full rotate-180 transform blur-[2px]" viewBox="0 24 150 24" preserveAspectRatio="none">
        <defs>
          <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v60h-352z" />
        </defs>
        <g>
          <use
            className="wave"
            xlinkHref="#wave"
            fill="#ced2fc"
            x="50"
            y="0"
            style={{ ...waveStyle, animationDelay: '-2s', animationDuration: '12s' }}
          />
          <use
            className="wave"
            xlinkHref="#wave"
            fill="#a8b0f6"
            x="50"
            y="2"
            style={{ ...waveStyle, animationDelay: '-4s', animationDuration: '9s' }}
          />
          <use
            className="wave"
            xlinkHref="#wave"
            fill="#818cf8"
            x="50"
            y="4"
            style={{ ...waveStyle, animationDelay: '-6s', animationDuration: '6s' }}
          />
        </g>
        <style>{`
    @keyframes move {
      from { transform: translate(85px, 0%); }
      to { transform: translate(-90px, 0%); }
    }
  `}</style>
      </svg>
    </div>
  )
}

export default Flow
