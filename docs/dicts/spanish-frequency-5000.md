# 西班牙语高频 5000 词库

本文说明 Qwerty Learner 新增的西班牙语词库：词条范围、来源与许可、文件改动、使用方式，以及和 [如何导入新的词典](../toBuildDict.md) 的对应关系。

这是一份 **5000 词元（lemma）** 的西班牙语频率词库，供打字练习与词汇学习。动词用不定式，名词/形容词用词典原形；并单独收录 `no`、`la`、`me`、`muy` 等被词元表误并入其他条目的高频虚词。

**不是** Mark Davies *A Frequency Dictionary of Spanish* 的摘录或扫描，也与任何商业教材无从属关系。

## 1. 词库

| 项 | 值 |
| --- | --- |
| 词典 id | `spanish-frequency-5000` |
| 展示名 | 西班牙语高频 5000 |
| 分类 | 西班牙语学习 |
| 标签 | 高频、基础 |
| 语言 | `language: 'es'` / `languageCategory: 'es'` |
| 文件 | `public/dicts/SpanishFrequency5000.json` |
| 词条数 | 5000 |

格式：

```json
{
  "name": "hacer",
  "trans": ["做；作；使"]
}
```

- `name`：西班牙语词形（含 `á é í ó ú ü ñ`）
- `trans`：中文释义

## 2. 来源与许可

| 数据 | 来源 | 许可 |
| --- | --- | --- |
| 词频 / 词元 | [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) OpenSubtitles 统计，经 [doozan/spanish_data](https://github.com/doozan/spanish_data) `frequency.csv` 归并到词元 | CC BY-SA 3.0 |
| 英语义项 | 英语维基词典，经 `es-en.data` | CC BY-SA |
| 中文释义 | 高频虚词与常用词人工撰写；其余由英语义项对照开源英汉词典整理 | 人工部分与整理结果随本仓库许可 |

未使用受版权保护的频率词典正文（例如 Davies 的 5000 词表与例句）。

筛选：去掉英文字母词、英语人名地名、词性为 letter/prefix 的条目，以及多数专有名词；保留西班牙及西语国家地名、`Dios`、`Navidad` 等学习中常见专名。

## 3. 对照 `docs/toBuildDict.md`

| 文档条款 | 本词库 |
| --- | --- |
| 1.1 `{ name, trans }` | 符合 |
| 1.2 `/public/dicts/` | `SpanishFrequency5000.json` |
| 1.3 索引 | `src/resources/dictionary.ts`（实际路径） |
| `id` 唯一 | `spanish-frequency-5000` |
| `length` | 与 JSON 条数一致（5000） |
| `language` | `es` |
| `tags` / `languageCategory` | 已按代码要求补齐 |

西班牙语是**新语言**，因此还改了类型、词库页 Tab、国旗和有道发音。输入走默认 `TextAreaHandler`，以便打出重音字母和 `ñ`。

## 4. 代码改动

| 文件 | 作用 |
| --- | --- |
| `public/dicts/SpanishFrequency5000.json` | 词库 |
| `src/resources/dictionary.ts` | 注册词典 |
| `src/typings/index.ts` | 增加 `es` |
| `src/resources/soundResource.ts` | 发音选项「西班牙语」 |
| `src/hooks/usePronunciation.ts` | 有道 `le=es` |
| `src/pages/Gallery-N/LanguageTabSwitcher.tsx` | 「西班牙语」Tab |
| `src/assets/flags/es.png` | 西班牙国旗图标 |

## 5. 使用说明

1. 词库页选择 **西班牙语**。
2. 打开 **西班牙语高频 5000**。
3. 请使用能输入 `á é í ó ú ü ñ ¿ ¡` 的键盘（西班牙语布局，或带 Option / 死键的布局）。
4. 发音走有道西班牙语语音。

## 6. 维护

- 增删词条后同步 `length`，或运行 `scripts/update-dict-size.js`。
- 不要改 `id`。
- 不要把词库挂到 `languageCategory: 'en'` 或 `'de'`。
- 虚词请保留独立词条（`el` / `la` / `no` / `me` 等），不要只留被归并后的词元。
