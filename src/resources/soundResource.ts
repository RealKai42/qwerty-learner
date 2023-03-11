import { SoundResource } from '@/typings'

export const SOUND_URL_PREFIX = './sounds/'

// will add more sound resource and add config ui in the future

export const keySoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'click.wav' }]

export const wrongSoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'beep.wav' }]

export const correctSoundResources: SoundResource[] = [{ key: '1', name: '声音1', filename: 'correct.wav' }]
