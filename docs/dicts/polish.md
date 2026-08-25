# 波兰语常用词词库

本文说明 Qwerty Learner 新增的波兰语词库：内容范围、文件改动、使用方式，以及和 [如何导入新的词典](../toBuildDict.md) 的对应关系。

## 1. 为什么要加波兰语

Qwerty Learner 现有语言分类包括英语、日语、德语、哈萨克语、印尼语和 Code。波兰语使用拉丁字母，并包含变音符号：

`ą ć ę ł ń ó ś ź ż`

适合「打字练习 + 记单词」同时进行。此前仓库中没有波兰语分类，只加 JSON 不会出现在词库页的语言 Tab 上，因此本改动同时补齐语言类型、Tab、国旗和发音。

## 2. 词库内容

| 项 | 值 |
| --- | --- |
| 词典 id | `polish_core` |
| 展示名 | 波兰语常用词 |
| 分类 | 波兰语学习 |
| 标签 | 基础 |
| 语言 | `language: 'pl'` / `languageCategory: 'pl'` |
| 文件 | `public/dicts/polish.json` |
| 词条数 | 1264 |

词条格式与文档约定一致：

```json
{
  "name": "dzień dobry",
  "trans": ["早上好；您好"]
}
```

- `name`：波兰语单词或常用短语（含变音符号）
- `trans`：中文释义，一条或多条

覆盖范围：问候、代词、介词、数字、时间、家庭、职业、身体、饮食、服装、颜色、自然、城市交通、学校工作、常用动词（含完成体 / 未完成体）、形容词，以及少量日常短句。

词形约定：

- 名词：主格单数
- 动词：不定式
- 形容词：阳性主格单数

## 3. 对照 `docs/toBuildDict.md`

| 文档条款 | 本词库 |
| --- | --- |
| 1.1 JSON 结构 `{ name, trans }` | `public/dicts/polish.json` |
| 1.2 放到 `/public/dicts/` | 是 |
| 1.3 在词典索引中注册 | `src/resources/dictionary.ts`（仓库实际路径；文档写成 `/resources/dictionary.ts`） |
| `id` 唯一 | `polish_core` |
| `url` | `/dicts/polish.json`（与现有词库一致） |
| `length` | 1264，与 JSON 数组长度一致 |
| `language` | `pl` |
| 代码还要求 `tags`、`languageCategory` | 已补齐 |

波兰语是**新语言**，因此除词库 JSON 和索引外，还改了类型定义、词库页 Tab、国旗和有道发音。文档默认场景是往已有语言里加一本词典；不加这些，词库登记后也无法从界面选到。

## 4. 代码改动

| 文件 | 作用 |
| --- | --- |
| `public/dicts/polish.json` | 词库数据 |
| `src/resources/dictionary.ts` | 注册词典 |
| `src/typings/index.ts` | 增加 `pl`：`LanguageType` / `LanguageCategoryType` / `PronunciationType` / `PhoneticType` |
| `src/resources/soundResource.ts` | 发音选项「波兰语」 |
| `src/hooks/usePronunciation.ts` | 有道 `dictvoice?audio=...&le=pl` |
| `src/pages/Gallery-N/LanguageTabSwitcher.tsx` | 词库页「波兰语」Tab |
| `src/assets/flags/pl.png` | 波兰国旗图标 |

输入走现有默认路径 `TextAreaHandler`（不是 `en` / `de` / `romaji` 的按键监听）。波兰语程序员键盘上的 AltGr 变音符号可以正常输入。

## 5. 使用说明

1. 打开 Qwerty Learner，进入词库页。
2. 选择语言 Tab **波兰语**。
3. 打开 **波兰语常用词**，按章节练习。
4. 发音请保持开启；单词会请求有道波兰语语音。
5. 请切换到波兰语键盘或能打出 `ą ć ę ł ń ó ś ź ż` 的布局。

## 6. 维护

- 增删词条后，同步修改 `dictionary.ts` 中的 `length`，或运行 `scripts/update-dict-size.js`。
- `id` 不要改，以免用户进度对不上。
- 不要把波兰语词库挂到 `languageCategory: 'en'` 或 `'de'`。
