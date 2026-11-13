import {
  KEY_SOUND_URL_PREFIX,
  SOUND_URL_PREFIX,
  correctSoundResources,
  keySoundResources,
  wrongSoundResources,
} from '@/resources/soundResource'
import { hintSoundsConfigAtom, keySoundsConfigAtom } from '@/store'
import noop from '@/utils/noop'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import useSound from 'use-sound'

const defaultKeyResource = keySoundResources.find((item) => item.key === 'Default') || keySoundResources[0]
const defaultWrongResource = wrongSoundResources[0]
const defaultCorrectResource = correctSoundResources[0]

function isValidResource(resource: unknown, list: { key: string; filename: string }[]): resource is { key: string; filename: string } {
  return (
    resource != null &&
    typeof resource === 'object' &&
    'filename' in resource &&
    'key' in resource &&
    list.some(
      (item) => item.filename === (resource as Record<string, unknown>).filename && item.key === (resource as Record<string, unknown>).key,
    )
  )
}

export type PlayFunction = ReturnType<typeof useSound>[0]

export default function useKeySound(): [PlayFunction, PlayFunction, PlayFunction] {
  const { isOpen: isKeyOpen, isOpenClickSound, volume: keyVolume, resource: rawKeyResource } = useAtomValue(keySoundsConfigAtom)
  const setKeySoundsConfig = useSetAtom(keySoundsConfigAtom)
  const {
    isOpen: isHintOpen,
    isOpenWrongSound,
    isOpenCorrectSound,
    volume: hintVolume,
    wrongResource: rawWrongResource,
    correctResource: rawCorrectResource,
  } = useAtomValue(hintSoundsConfigAtom)

  const keyResource = isValidResource(rawKeyResource, keySoundResources) ? rawKeyResource : defaultKeyResource
  const wrongResource = isValidResource(rawWrongResource, wrongSoundResources) ? rawWrongResource : defaultWrongResource
  const correctResource = isValidResource(rawCorrectResource, correctSoundResources) ? rawCorrectResource : defaultCorrectResource

  const fixAppliedRef = useRef(false)

  useEffect(() => {
    if (keyResource !== rawKeyResource && !fixAppliedRef.current) {
      fixAppliedRef.current = true
      setKeySoundsConfig((prev) => ({ ...prev, resource: keyResource }))
    }
  }, [keyResource, rawKeyResource, setKeySoundsConfig])

  const keySoundUrl = `${KEY_SOUND_URL_PREFIX}${keyResource.filename}`

  const [playClickSound] = useSound(keySoundUrl, {
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

  return [
    isKeyOpen && isOpenClickSound ? playClickSound : noop,
    isHintOpen && isOpenWrongSound ? playWrongSound : noop,
    isHintOpen && isOpenCorrectSound ? playCorrectSound : noop,
  ]
}
