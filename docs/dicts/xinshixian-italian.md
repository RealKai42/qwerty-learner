# 新视线意大利语 A1–A2 词库

本文说明 Qwerty Learner 新增的意大利语词库：对应教材与级别、词条范围、文件改动、使用方式，以及和 [如何导入新的词典](../toBuildDict.md) 的对应关系。

《新视线意大利语 1》（北京语言大学出版社）面向初级学习者，目标水平为欧洲语言共同参考框架 **A1–A2**。本词库按该书常见课次主题整理常用词，**不是教材词汇表扫描或原文摘录**，与出版社、原作者无从属或背书关系。「新视线」仅用于标明所对标的教材系列与级别。

## 1. 词库

| 项 | 值 |
| --- | --- |
| 词典 id | `xinshixian-italian-a1a2` |
| 展示名 | 新视线意大利语 A1-A2 |
| 分类 | 意大利语学习 |
| 标签 | 初级、A1-A2 |
| 语言 | `language: 'it'` / `languageCategory: 'it'` |
| 文件 | `public/dicts/XinShiXianItalian_A1A2.json` |
| 词条数 | 889 |

格式：

```json
{
  "name": "buongiorno",
  "trans": ["早上好；您好"]
}
```

- `name`：意大利语单词或常用短语（含 `à è é ì ò ù`）
- `trans`：中文释义

词形：名词单数、动词不定式、形容词阳性单数。少量问候、点餐、问路短句按课堂上的完整说法收录。

## 2. 课次主题

顺序大致对应《新视线意大利语》初级常见单元，便于跟课练习：

| 主题 | 内容举例 |
| --- | --- |
| 预备单元 欢迎 | 问候、人称、阴阳性、冠词 |
| 第一单元 新开端 | 职业、国籍、城市、外貌性格 |
| 第二单元 业余时间 | 爱好、住址、星期、钟点、数字 |
| 第三单元 写信与打电话 | 联络、地点、物主、礼貌用语 |
| 第四单元 在酒吧 | 饮品点心、点单、周末与过去 |
| 第五单元 节日与旅行 | 交通、住宿、天气、节日 |
| 第六单元 在外面吃晚饭 | 家庭、餐厅、食物 |
| 第七单元 看电影 | 影片类型、评价 |
| 第八单元 亲戚来访 | 拜访、健康 |
| 第九单元 服装与购物 | 衣物、颜色、尺码、价格 |
| 第十单元 报刊亭 / 城市 | 报纸、银行、问路 |
| 第十一单元 音乐与礼物 | 音乐、邀请、祝福 |
| 语法骨架 | 常用动词不定式、形容词、介词、副词 |

## 3. 对照 `docs/toBuildDict.md`

| 文档条款 | 本词库 |
| --- | --- |
| 1.1 `{ name, trans }` | 符合 |
| 1.2 `/public/dicts/` | `XinShiXianItalian_A1A2.json` |
| 1.3 索引 | `src/resources/dictionary.ts`（实际路径） |
| `id` 唯一 | `xinshixian-italian-a1a2` |
| `length` | 与 JSON 条数一致 |
| `language` | `it` |
| `tags` / `languageCategory` | 已按代码要求补齐 |

意大利语是**新语言**，因此还改了类型、词库页 Tab、国旗和有道发音。输入走默认 `TextAreaHandler`，以便打出重音字母。

## 4. 代码改动

| 文件 | 作用 |
| --- | --- |
| `public/dicts/XinShiXianItalian_A1A2.json` | 词库 |
| `src/resources/dictionary.ts` | 注册词典 |
| `src/typings/index.ts` | 增加 `it` |
| `src/resources/soundResource.ts` | 发音选项「意大利语」 |
| `src/hooks/usePronunciation.ts` | 有道 `le=it` |
| `src/pages/Gallery-N/LanguageTabSwitcher.tsx` | 「意大利语」Tab |
| `src/assets/flags/it.png` | 意大利国旗图标 |

## 5. 使用说明

1. 词库页选择 **意大利语**。
2. 打开 **新视线意大利语 A1-A2**。
3. 请使用能输入 `à è é ì ò ù` 的键盘（意大利语布局，或带 Option / 死键的布局）。
4. 发音走有道意大利语语音。

## 6. 维护

- 增删词条后同步 `length`，或运行 `scripts/update-dict-size.js`。
- 不要改 `id`。
- 不要把词库挂到 `languageCategory: 'en'` 或 `'de'`。
