import { KEY_SOUND_URL_PREFIX } from '@/resources/soundResource'
import type { SoundResource } from '@/typings'
import { Howl, Howler } from 'howler'

export function playKeySoundResource(soundResource: SoundResource) {
  const path = KEY_SOUND_URL_PREFIX + soundResource.filename
  const sound = new Howl({
    src: path,
    format: ['wav'],
  })
  Howler.volume(1)
  sound.play()
}
