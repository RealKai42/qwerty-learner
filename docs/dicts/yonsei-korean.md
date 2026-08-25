# 《延世韩国语》1–6 册词库

本文说明 Qwerty Learner 新增的韩语词库：六册教材如何对应初级 / 中级 / 高级、词条来源与许可、文件改动、输入法注意事项，以及和 [如何导入新的词典](../toBuildDict.md) 的对应关系。

本词库由社区整理，**与延世大学及延世大学韩国语学堂无从属、赞助或背书关系**。「延世」仅用于标明所索引的教材系列。

## 1. 词库一览

按《延世韩国语》册次拆成 6 本词典，词库页语言 Tab 为 **韩语**，可用标签筛选级别。

| 词典 id | 展示名 | 级别 | 文件 | 词条数 |
| --- | --- | --- | --- | ---: |
| `yonsei-korean-1` | 延世韩国语 1 | 初级 | `public/dicts/YonseiKorean1.json` | 989 |
| `yonsei-korean-2` | 延世韩国语 2 | 初级 | `public/dicts/YonseiKorean2.json` | 872 |
| `yonsei-korean-3` | 延世韩国语 3 | 中级 | `public/dicts/YonseiKorean3.json` | 604 |
| `yonsei-korean-4` | 延世韩国语 4 | 中级 | `public/dicts/YonseiKorean4.json` | 556 |
| `yonsei-korean-5` | 延世韩国语 5 | 高级 | `public/dicts/YonseiKorean5.json` | 855 |
| `yonsei-korean-6` | 延世韩国语 6 | 高级 | `public/dicts/YonseiKorean6.json` | 477 |

合计 **4445** 条。级别划分：1–2 册初级，3–4 册中级，5–6 册高级。

索引字段：

- `category`: `韩语学习`
- `tags`: `初级` / `中级` / `高级`
- `language`: `ko`
- `languageCategory`: `ko`

## 2. 词条格式

与 `toBuildDict.md` 约定一致，并带上词性：

```json
{
  "name": "선생님",
  "trans": ["名. 老师"]
}
```

- `name`：韩语词形（谚文）。教材里的表达、助词、少量拉丁缩写（如 `NGO`）也按原文保留。
- `trans`：`词性. 中文释义`，词性来自源数据的 `pos_zh`（名 / 动 / 形 / 助 / 表达 等）。
- 顺序：与教材课次、单元顺序一致，同一词在不同课出现时不合并。

日语词库用罗马音作为 `name`、假名汉字作为 `notation`。韩语这里让 `name` 直接为谚文，练习的是韩语输入，而不是罗马音转写。

## 3. 来源与许可

词条整理自 [Open Yonsei Korean Vocabulary](https://github.com/Amulopapa67/open-yonsei-korean-vocabulary) v0.1.0 公开数据集。

- 源数据许可：**CC BY-SA 3.0**
- 转换方式：只抽取 `korean` + `chinese`（及词性），不收录课文、例句、练习、音频或官方视觉素材。

建议署名：

```text
Open Yonsei Korean Vocabulary contributors,
“Open Yonsei Korean Vocabulary dataset”, version 0.1.0,
CC BY-SA 3.0.
```

分享修改后的词表时，请保留署名并遵守相同方式共享。

## 4. 对照 `docs/toBuildDict.md`

| 文档条款 | 本词库 |
| --- | --- |
| 1.1 JSON 结构 `{ name, trans }` | 六册均符合 |
| 1.2 放到 `/public/dicts/` | `YonseiKorean1.json` … `YonseiKorean6.json` |
| 1.3 在词典索引中注册 | `src/resources/dictionary.ts`（实际路径；文档写成 `/resources/dictionary.ts`） |
| `id` 唯一 | `yonsei-korean-1` … `yonsei-korean-6` |
| `url` | `/dicts/YonseiKoreanN.json` |
| `length` | 与各 JSON 数组长度一致 |
| `language` | `ko` |
| 代码还要求 `tags`、`languageCategory` | 已按级别补齐 |

韩语是**新语言**，因此除 JSON 和索引外，还改了类型、Tab、国旗、有道发音，以及输入法组字。文档默认场景是往已有语言里加词典；谚文必须用输入法，不能沿用「请关闭输入法」的英文逻辑。

## 5. 代码改动

| 文件 | 作用 |
| --- | --- |
| `public/dicts/YonseiKorean{1-6}.json` | 六册词库 |
| `src/resources/dictionary.ts` | 注册 6 本词典 |
| `src/typings/index.ts` | 增加 `ko` |
| `src/resources/soundResource.ts` | 发音选项「韩语」 |
| `src/hooks/usePronunciation.ts` | 有道 `dictvoice?audio=...&le=ko` |
| `src/pages/Gallery-N/LanguageTabSwitcher.tsx` | 词库页「韩语」Tab |
| `src/assets/flags/ko.png` | 韩国国旗图标 |
| `src/pages/Typing/components/WordPanel/components/InputHandler/index.tsx` | 韩语走 `TextAreaHandler` |
| `src/pages/Typing/components/WordPanel/components/TextAreaHandler/index.tsx` | `language === 'ko'` 时允许输入法组字 |

英文等拉丁字母词库仍会在组字开始时提示关闭输入法。

## 6. 使用说明

1. 打开 Qwerty Learner，进入词库页。
2. 选择语言 Tab **韩语**。
3. 按标签选初级 / 中级 / 高级，或直接打开对应册次。
4. **打开韩语输入法**（两套或三套皆可），按音节组字。
5. 发音请保持开启；单词会请求有道韩语语音。

## 7. 维护

- 增删词条后同步 `length`，或运行 `scripts/update-dict-size.js`。
- 不要改 `id`，以免用户进度对不上。
- 更新源数据时请核对许可与署名，并保持教材顺序。
- 不要把韩语词库挂到 `languageCategory: 'ja'` 或 `'en'`。
