import useSound from 'use-sound'
import clickSoundFileUrl from 'assets/click.wav'
import beepSoundFileUrl from 'assets/beep.wav'
import hintSoundFileUrl from 'assets/hint.wav'
import { noop } from 'lodash'
import { useAppSettings } from 'components/AppSettings'

export type PlayFunction = ReturnType<typeof useSound>[0]

export default function useKeySound(): [PlayFunction, PlayFunction, PlayFunction] {
  const { sound } = useAppSettings()
  const [playClickSound] = useSound(clickSoundFileUrl)
  const [playBeepSound] = useSound(beepSoundFileUrl)
  const [playSuccessSound] = useSound(hintSoundFileUrl)
  return sound ? [playClickSound, playBeepSound, playSuccessSound] : [noop, noop, noop]
}
