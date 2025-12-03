export function isKanji(ch: string) {
  ch = ch[0]
  return (ch >= '\u4e00' && ch <= '\u9fcf') || (ch >= '\uf900' && ch <= '\ufaff') || (ch >= '\u3400' && ch <= '\u4dbf')
}

/**
 * 将各种日语输入规范化，用于请求发音：
 * - 带汉字的词/带括号（优先取抽取汉字和括号外假名组合，也就是去掉括号及括号内内容）
 * - 纯假名
 * - 罗马字
 */
export function normalizeJapaneseWord(word: string): string {
  // 带括号（例：塩(しお)）
  if (word.includes('(') && word.includes(')')) {
    // 括号前包含汉字
    if (/[\u4e00-\u9fcf\uf900-\ufaff\u3400-\u4dbf]/.test(word)) {
      const kanji = extractKanjiFromNotation(word)
      return kanji
    }

    // 纯假名括号（优先括号内）
    const kanaMatch = word.match(/\((.*?)\)/)
    const kana = kanaMatch ? kanaMatch[1] : word
    return kana
  }

  // 是纯假名
  if (/^[\u3040-\u309F\u30A0-\u30FF]+$/.test(word)) {
    return word
  }

  // 含汉字（取汉字本体）
  if (/[\u4e00-\u9fcf\uf900-\ufaff\u3400-\u4dbf]/.test(word)) {
    return extractKanjiFromNotation(word)
  }

  // 否则为 romaji → 转假名
  return romajiToHiragana(word)
}

export function extractKanjiFromNotation(notation: string) {
  // 移除括号及里面的内容，例： "塩(しお)" → "塩", "古(ふる)い" → "古い"
  return notation.replace(/\(.*?\)/, '')
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
