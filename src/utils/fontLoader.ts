import type { FontResource } from '@/resources/fontResource'

const loadedFonts = new Set<string>()

export async function loadFont(resource: FontResource): Promise<void> {
  if (resource.key === 'system-default' || loadedFonts.has(resource.key)) return

  for (const file of resource.fontFiles) {
    const familyName = resource.family.replace(/^["']|["']$/g, '')
    const fontFace = new FontFace(familyName, `url(${file.url})`, {
      weight: String(file.weight),
      style: file.style,
      display: 'swap',
    })
    try {
      await fontFace.load()
      document.fonts.add(fontFace)
    } catch {
      // Font file may not exist (e.g. some subsets); skip silently
    }
  }

  loadedFonts.add(resource.key)
}
