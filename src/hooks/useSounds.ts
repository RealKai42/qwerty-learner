import { useAtomValue } from 'jotai'
import useSound from 'use-sound'
import clickSoundFileUrl from '@/assets/click.wav'
import beepSoundFileUrl from '@/assets/beep.wav'
import hintSoundFileUrl from '@/assets/hint.wav'
import { noop } from 'lodash'
import { keySoundsConfigAtom } from '@/store'

export type PlayFunction = ReturnType<typeof useSound>[0]

export default function useKeySound(): [PlayFunction, PlayFunction, PlayFunction] {
  const keySoundsConfig = useAtomValue(keySoundsConfigAtom)

  const [playClickSound] = useSound(clickSoundFileUrl)
  const [playBeepSound] = useSound(beepSoundFileUrl)
  const [playSuccessSound] = useSound(hintSoundFileUrl)

  // todo: add volume control

  return keySoundsConfig.isOpen ? [playClickSound, playBeepSound, playSuccessSound] : [noop, noop, noop]
}
