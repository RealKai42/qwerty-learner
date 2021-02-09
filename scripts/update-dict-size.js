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
  fs
    .readFileSync(sourceFilePath, { encoding: 'utf-8' })
    .replace(/dicts\/([a-zA-Z0-9_-]+.json)',([\n\s]+)length: \d+/gm, (original, dictFileName, whiteSpace) => {
      console.log(dictFileName)
      return dictSizeMap[dictFileName] ? `dicts/${dictFileName}',${whiteSpace}length: ${dictSizeMap[dictFileName]}` : original
    }),
)
