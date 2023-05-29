import type { NotationInfo } from '@/pages/Typing/hooks/useNotationInfo'
import React from 'react'

type NotationProps = {
  infos: NotationInfo[]
}

export default function Notation({ infos }: NotationProps) {
  return (
    <div className="mx-auto flex h-20 items-end">
      <ruby className="mb-1 p-0 font-mono text-5xl text-gray-800 dark:text-opacity-80">
        {infos.map(({ word, phonetic }, index) => {
          const hasPhonetic = phonetic && phonetic.length > 0
          const isEmptyPhonetic = hasPhonetic && phonetic.trim().length == 0
          return (
            <React.Fragment key={index}>
              {word}
              {hasPhonetic && isEmptyPhonetic ? (
                <>
                  <rt>{phonetic}</rt>
                </>
              ) : (
                <>
                  <rp>{'('}</rp>
                  <rt>{phonetic}</rt>
                  <rp>{')'}</rp>
                </>
              )}
            </React.Fragment>
          )
        })}
      </ruby>
    </div>
  )
}
