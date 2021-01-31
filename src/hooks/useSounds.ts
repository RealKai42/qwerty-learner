import useSound from 'use-sound'
import clickSoundFileUrl from '../assets/click.wav'
import beepSoundFileUrl from '../assets/beep.wav'
import hintSoundFileUrl from '../assets/hint.wav'

export type PlayFunction = ReturnType<typeof useSound>[0]

export default function useKeySound(): [PlayFunction, PlayFunction, PlayFunction] {
  const [playClickSound] = useSound(clickSoundFileUrl)
  const [playBeepSound] = useSound(beepSoundFileUrl)
  const [playSuccessSound] = useSound(hintSoundFileUrl)
  return [playClickSound, playBeepSound, playSuccessSound]
}
