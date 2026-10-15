const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = ts.transpileModule(fs.readFileSync('src/utils/kana.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const kana = { exports: {} }
new Function('exports', source)(kana.exports)
const { matchRomajiInput } = kana.exports
for (const [target, spelling] of [
  ['shichitsufuji', 'sitituhuzi'],
  ['shichitsufuji', 'shiti tsu fu ji'.replaceAll(' ', '')],
  ['shashushocheja', 'syasyusyotyezya'],
  ['matcha', 'mattya'],
  ['gakkou', 'gakkou'],
  ['chou', 'cyou'],
  ['cyou', 'chou'],
  ['chou', 'tyou'],
  ['matcha', 'maccya'],
  ['sensabannbetu', 'sennsabannbetu'],
  ['sennsabannbetu', 'sensabanbetu'],
  ['sensabannbetu', 'sennsabanbetsu'],
  ['konnichiha', 'konnitiha'],
  ['kanpai', 'kannpai'],
  ["manben'naku", 'mannbennnaku'],
  ["manben'naku", 'manbennaku'],
  ["manben'naku", "manben'naku"],
  ["manben'naku", "mannben'naku"],
  ["shin'you", 'sinnyou'],
  ["shin'ichi", 'shinnichi'],
  ["MANBEN'NAKU", 'MANNBENNNAKU'],
  ['zasshi', 'zassi'],
  ['icchi', 'itti'],
  ['sitituhuzi', 'shichitsufuji'],
  ['SHICHI', 'SITI'],
  ["shin'you", "sin'you"],
]) {
  for (let i = 1; i <= spelling.length; i++) {
    const result = matchRomajiInput(target, spelling.slice(0, i))
    assert.ok(result !== null, `${target}: prefix ${spelling.slice(0, i)}`)
    assert.ok(result.toLowerCase().startsWith(spelling.slice(0, i).toLowerCase()))
    assert.equal(result.length === i, i === spelling.length)
  }
}
assert.equal(matchRomajiInput('shi', 'su'), null)
assert.equal(matchRomajiInput('shi', 'shii'), null)
assert.equal(matchRomajiInput('shi', 'SI', false), null)
assert.equal(matchRomajiInput('shi', 'si', false), 'si')
assert.equal(matchRomajiInput('kan', 'ka'), 'kan')
assert.equal(matchRomajiInput('kana', 'kanna'), null)
assert.equal(matchRomajiInput('konnichiha', 'konichiha'), null)
assert.equal(matchRomajiInput('kanpai', 'kannnpai'), null)
assert.equal(matchRomajiInput("manben'naku", "manbenn'naku"), null)
assert.equal(matchRomajiInput("manben'naku", 'manbenaku'), null)
assert.equal(matchRomajiInput("shin'you", 'shinyou'), null)
assert.equal(matchRomajiInput("shin'ichi", 'shinichi'), null)
const { formatRomajiDisplay } = kana.exports
assert.equal(formatRomajiDisplay('shichitsufuji', true), 'sitituhuzi')
assert.equal(formatRomajiDisplay('sitituhuzi', false), 'shichitsufuji')
assert.equal(formatRomajiDisplay('matcha icchi cyou', true), 'mattya itti tyou')
assert.equal(formatRomajiDisplay('mattya itti cyou', false), 'maccha icchi chou')
assert.equal(formatRomajiDisplay("MANBEN'NAKU", true), "MANBEN'NAKU")
for (const kunrei of [true, false]) {
  const target = formatRomajiDisplay('shichitsufuji', kunrei)
  for (const spelling of ['shichitsufuji', 'sitituhuzi', 'shititsuhuji']) {
    assert.equal(matchRomajiInput(target, spelling), spelling)
  }
}
// Check every alias in both directions, every key prefix, and both hint settings.
const aliasGroups = [
  ['sha', 'sya'],
  ['shu', 'syu'],
  ['she', 'sye'],
  ['sho', 'syo'],
  ['cha', 'tya', 'cya'],
  ['chu', 'tyu', 'cyu'],
  ['che', 'tye', 'cye'],
  ['cho', 'tyo', 'cyo'],
  ['ja', 'zya', 'jya'],
  ['ju', 'zyu', 'jyu'],
  ['je', 'zye', 'jye'],
  ['jo', 'zyo', 'jyo'],
  ['cyi', 'tyi'],
  ['jyi', 'zyi'],
]
for (const variants of aliasGroups) {
  for (const original of variants) {
    for (const kunrei of [false, true]) {
      assert.equal(formatRomajiDisplay(original, kunrei), variants[kunrei ? 1 : 0])
      for (const spelling of variants) {
        // Add a suffix so every tested prefix is unambiguously incomplete.
        for (const doubled of [false, true]) {
          const target = (doubled ? original[0] : '') + original + 'u'
          const input = (doubled ? spelling[0] : '') + spelling + 'u'
          const hint = formatRomajiDisplay(target, kunrei)
          for (let i = 1; i <= input.length; i++) {
            const result = matchRomajiInput(hint, input.slice(0, i))
            assert.ok(result !== null, `${hint}: ${input.slice(0, i)}`)
            assert.ok(result.startsWith(input.slice(0, i)))
            assert.equal(result.length === i, i === input.length)
          }
        }
      }
    }
  }
}
assert.equal(matchRomajiInput('jou', 'jyou', false), 'jyou')
assert.equal(matchRomajiInput('JOU', 'JYOU', false), 'JYOU')
assert.equal(matchRomajiInput('jou', 'JYOU', false), null)
assert.equal(matchRomajiInput('jou', 'jyuu'), null)
assert.equal(matchRomajiInput('jou', 'jyyou'), null)
assert.equal(matchRomajiInput('kyo', 'ksho'), null)
console.log('Romaji compatibility checks passed')
