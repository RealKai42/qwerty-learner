import { SOUND_URL_PREFIX } from '@/resources/soundResource'
import { keySoundsConfigAtom, hintSoundsConfigAtom } from '@/store'
import noop from '@/utils/noop'
import { useAtomValue } from 'jotai'
import useSound from 'use-sound'

export type PlayFunction = ReturnType<typeof useSound>[0]

export default function useKeySound(): [PlayFunction, PlayFunction, PlayFunction] {
  const { isOpen: isKeyOpen, isOpenClickSound, volume: keyVolume, resource: keyResource } = useAtomValue(keySoundsConfigAtom)
  const {
    isOpen: isHintOpen,
    isOpenWrongSound,
    isOpenCorrectSound,
    volume: hintVolume,
    wrongResource,
    correctResource,
  } = useAtomValue(hintSoundsConfigAtom)

  const [playClickSound] = useSound(`${SOUND_URL_PREFIX}${keyResource.filename}`, {
    volume: keyVolume,
    interrupt: true,
  })
  const [playWrongSound] = useSound(`${SOUND_URL_PREFIX}${wrongResource.filename}`, {
    volume: hintVolume,
    interrupt: true,
  })
  const [playCorrectSound] = useSound(`${SOUND_URL_PREFIX}${correctResource.filename}`, {
    volume: hintVolume,
    interrupt: true,
  })

  // todo: add volume control

  return [
    isKeyOpen && isOpenClickSound ? playClickSound : noop,
    isHintOpen && isOpenWrongSound ? playWrongSound : noop,
    isHintOpen && isOpenCorrectSound ? playCorrectSound : noop,
  ]
}
