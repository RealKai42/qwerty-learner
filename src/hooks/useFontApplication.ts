import { foreignFontConfigAtom, translateFontConfigAtom } from '@/store'
import { loadFont } from '@/utils/fontLoader'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

export function useFontApplication() {
  const foreignFontConfig = useAtomValue(foreignFontConfigAtom)
  const translateFontConfig = useAtomValue(translateFontConfigAtom)

  useEffect(() => {
    const { resource } = foreignFontConfig
    loadFont(resource)
    document.documentElement.style.setProperty('--font-foreign', resource.family || '')
  }, [foreignFontConfig])

  useEffect(() => {
    const { resource } = translateFontConfig
    loadFont(resource)
    document.documentElement.style.setProperty('--font-translate', resource.family || '')
  }, [translateFontConfig])
}
