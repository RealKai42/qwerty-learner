const fs = require('fs')
const path = require('path')

const dictSizeMap = Object.fromEntries(
  fs
    .readdirSync(path.join(__dirname, '..', 'public', 'dicts'))
    .filter((x) => x.endsWith('.json'))
    .map((fileName) => {
      return [fileName, JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'dicts', fileName), { encoding: 'utf-8' })).length]
    }),
)

const sourceFilePath = path.join(__dirname, '..', 'src', 'resources', 'dictionary.ts')
fs.writeFileSync(
  sourceFilePath,
  fs.readFileSync(sourceFilePath, { encoding: 'utf-8' }).replace(/dicts\/([\w-]+.json)', length: \d+/gm, (original, dictFileName) => {
    console.log(dictFileName)
    return dictSizeMap[dictFileName] ? `dicts/${dictFileName}', length: ${dictSizeMap[dictFileName]}` : original
  }),
)
