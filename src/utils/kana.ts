export function isKanji(ch: string) {
  ch = ch[0]
  return (ch >= '\u4e00' && ch <= '\u9fcf') || (ch >= '\uf900' && ch <= '\ufaff') || (ch >= '\u3400' && ch <= '\u4dbf')
}

/**
 * source: https://github.com/andree-surya/moji4j
 */
export function romajiToHiragana(romaji: string): string {
  const changeStr: string = romaji.toLowerCase()
  const resultStr: string[] = changeStr.split('')

  for (let i = 0; i < changeStr.length - 1; i++) {
    const currentCharacter = changeStr[i]
    const nextCharacter = changeStr[i + 1]

    const isDoubleConsonant = currentCharacter == nextCharacter && currentCharacter !== 'n'
    const isExceptionalCase = currentCharacter == 't' && nextCharacter == 'c'

    if (isRomanConsonant(currentCharacter) && (isDoubleConsonant || isExceptionalCase)) {
      resultStr[i] = 'っ'
    }
  }

  let result = ''
  let currentOffset = 0
  while (currentOffset < resultStr.length) {
    const maxSubstringLength = Math.min(4, resultStr.length - currentOffset)

    for (let substringLength = maxSubstringLength; substringLength > 0; substringLength--) {
      const substring = resultStr.slice(currentOffset, currentOffset + substringLength)

      const replacementString: string = romajiToHiraganaJson[substring.join('')]

      if (replacementString !== undefined && replacementString !== null) {
        result += replacementString
        currentOffset += substring.length
        break
      }

      if (substringLength == 1) {
        result += substring

        currentOffset += 1
        break
      }
    }
  }

  return result
}

function isRomanConsonant(character: string): boolean {
  return character >= 'a' && character <= 'z' && !isRomanVowel(character)
}

function isRomanVowel(character: string): boolean {
  return character == 'a' || character == 'i' || character == 'u' || character == 'e' || character == 'o'
}

/**
 * 黑本式(Hepburn)到训令式(Kunrei-shiki)的音节映射。
 * 日语词库中的罗马字默认采用黑本式拼写(如 shi/tsu/chi/fu/ji),
 * 而日本义务教育官方使用训令式(对应为 si/tu/ti/hu/zi),
 * 该映射用于在训令式输入模式下转换目标拼写。
 */
const hepburnToKunreiShikiSyllables: RomajiToHiragana = {
  shi: 'si',
  sha: 'sya',
  shu: 'syu',
  she: 'sye',
  sho: 'syo',
  chi: 'ti',
  cha: 'tya',
  chu: 'tyu',
  che: 'tye',
  cho: 'tyo',
  tsu: 'tu',
  fu: 'hu',
  ji: 'zi',
  ja: 'zya',
  ju: 'zyu',
  je: 'zye',
  jo: 'zyo',
}

/**
 * 将黑本式罗马字转换为训令式罗马字。
 * 使用最长音节匹配,未命中的字符保持原样(如长音符 "ou"、助词 "wo" 等不受影响)。
 */
export function hepburnToKunreiShiki(romaji: string): string {
  const lowerStr = romaji.toLowerCase()
  let result = ''
  let offset = 0

  while (offset < lowerStr.length) {
    const maxSyllableLength = Math.min(4, lowerStr.length - offset)
    let matched = false

    for (let length = maxSyllableLength; length > 0; length--) {
      const syllable = lowerStr.substring(offset, offset + length)
      const replacement = hepburnToKunreiShikiSyllables[syllable]

      if (replacement !== undefined) {
        result += replacement
        offset += length
        matched = true
        break
      }
    }

    if (!matched) {
      result += lowerStr[offset]
      offset += 1
    }
  }

  return result
}

interface RomajiToHiragana {
  [key: string]: string
}
const romajiToHiraganaJson: RomajiToHiragana = {
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'お',
  '-': 'ー',
  xa: 'ぁ',
  xi: 'ぃ',
  xu: 'ぅ',
  xe: 'ぇ',
  xo: 'ぉ',
  ka: 'か',
  ki: 'き',
  ku: 'く',
  ke: 'け',
  ko: 'こ',
  ca: 'か',
  cu: 'く',
  co: 'こ',
  ga: 'が',
  gi: 'ぎ',
  gu: 'ぐ',
  ge: 'げ',
  go: 'ご',
  sa: 'さ',
  si: 'し',
  su: 'す',
  se: 'せ',
  so: 'そ',
  za: 'ざ',
  zi: 'じ',
  zu: 'ず',
  ze: 'ぜ',
  zo: 'ぞ',
  ja: 'じゃ',
  ji: 'じ',
  ju: 'じゅ',
  je: 'じぇ',
  jo: 'じょ',
  ta: 'た',
  ti: 'ち',
  tu: 'つ',
  te: 'て',
  to: 'と',
  da: 'だ',
  di: 'ぢ',
  du: 'づ',
  de: 'で',
  do: 'ど',
  na: 'な',
  ni: 'に',
  nu: 'ぬ',
  ne: 'ね',
  no: 'の',
  ha: 'は',
  hi: 'ひ',
  hu: 'ふ',
  he: 'へ',
  ho: 'ほ',
  ba: 'ば',
  bi: 'び',
  bu: 'ぶ',
  be: 'べ',
  bo: 'ぼ',
  pa: 'ぱ',
  pi: 'ぴ',
  pu: 'ぷ',
  pe: 'ぺ',
  po: 'ぽ',
  va: 'ヴぁ',
  vi: 'ヴぃ',
  vu: 'ヴ',
  ve: 'ヴぇ',
  vo: 'ヴぉ',
  fa: 'ふぁ',
  fi: 'ふぃ',
  fu: 'ふ',
  fe: 'ふぇ',
  fo: 'ふぉ',
  ma: 'ま',
  mi: 'み',
  mu: 'む',
  me: 'め',
  mo: 'も',
  ya: 'や',
  yi: 'い',
  yu: 'ゆ',
  ye: 'いぇ',
  yo: 'よ',
  ra: 'ら',
  ri: 'り',
  ru: 'る',
  re: 'れ',
  ro: 'ろ',
  la: 'ら',
  li: 'り',
  lu: 'る',
  le: 'れ',
  lo: 'ろ',
  wa: 'わ',
  wi: 'ゐ',
  wu: 'う',
  we: 'ゑ',
  wo: 'を',
  tsu: 'つ',
  xka: 'ヵ',
  xke: 'ヶ',
  xwa: 'ゎ',
  xtsu: 'っ',
  xya: 'ゃ',
  xyu: 'ゅ',
  xyo: 'ょ',
  kya: 'きゃ',
  kyi: 'きぃ',
  kyu: 'きゅ',
  kye: 'きぇ',
  kyo: 'きょ',
  gya: 'ぎゃ',
  gyi: 'ぎぃ',
  gyu: 'ぎゅ',
  gye: 'ぎぇ',
  gyo: 'ぎょ',
  sya: 'しゃ',
  syi: 'しぃ',
  syu: 'しゅ',
  sye: 'しぇ',
  syo: 'しょ',
  sha: 'しゃ',
  shi: 'し',
  shu: 'しゅ',
  she: 'しぇ',
  sho: 'しょ',
  zya: 'じゃ',
  zyi: 'じぃ',
  zyu: 'じゅ',
  zye: 'じぇ',
  zyo: 'じょ',
  jya: 'じゃ',
  jyi: 'じぃ',
  jyu: 'じゅ',
  jye: 'じぇ',
  jyo: 'じょ',
  tya: 'ちゃ',
  tyi: 'ちぃ',
  tyu: 'ちゅ',
  tye: 'ちぇ',
  tyo: 'ちょ',
  cya: 'ちゃ',
  cyi: 'ちぃ',
  cyu: 'ちゅ',
  cye: 'ちぇ',
  cyo: 'ちょ',
  cha: 'ちゃ',
  chi: 'ち',
  chu: 'ちゅ',
  che: 'ちぇ',
  cho: 'ちょ',
  tha: 'てゃ',
  thi: 'てぃ',
  thu: 'てゅ',
  the: 'てぇ',
  tho: 'てょ',
  dya: 'ぢゃ',
  dyi: 'ぢぃ',
  dyu: 'ぢゅ',
  dye: 'ぢぇ',
  dyo: 'ぢょ',
  dha: 'でゃ',
  dhi: 'でぃ',
  dhu: 'でゅ',
  dhe: 'でぇ',
  dho: 'でょ',
  nya: 'にゃ',
  nyi: 'にぃ',
  nyu: 'にゅ',
  nye: 'にぇ',
  nyo: 'にょ',
  hya: 'ひゃ',
  hyi: 'ひぃ',
  hyu: 'ひゅ',
  hye: 'ひぇ',
  hyo: 'ひょ',
  bya: 'びゃ',
  byi: 'びぃ',
  byu: 'びゅ',
  bye: 'びぇ',
  byo: 'びょ',
  pya: 'ぴゃ',
  pyi: 'ぴぃ',
  pyu: 'ぴゅ',
  pye: 'ぴぇ',
  pyo: 'ぴょ',
  mya: 'みゃ',
  myi: 'みぃ',
  myu: 'みゅ',
  mye: 'みぇ',
  myo: 'みょ',
  rya: 'りゃ',
  ryi: 'りぃ',
  ryu: 'りゅ',
  rye: 'りぇ',
  ryo: 'りょ',
  lya: 'りゃ',
  lyi: 'りぃ',
  lyu: 'りゅ',
  lye: 'りぇ',
  lyo: 'りょ',
  n: 'ん',
  m: 'ん',
  "n'": 'ん',
  dzu: 'づ',
}
