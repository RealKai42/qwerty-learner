## 如何做出自己的词单
> 这是一种方法 有更方便的可以继续分享

### 制作 csv

> 工具： 欧路词典、excel、Numbers表格

#### STEP1 构建自己生词本
1. 在欧路词典中 添加一个生词本，并勾选默认添加到此生词本

2. 正常看单词，不会的点击收藏
> 此收藏会自动添加到设置默认添加的生词本中，请确保默认添加生词本的正确性。

3. 登陆`my.eudic.net` --> 我的生词本 --> 生词本工具 --> 打印当前列表 --> 复制到excel中

4. excel中的格式
```
name | trans
单词	| [翻译]
```
> 翻译一览可以在新的列C使用 `="["&B2&"]"`

5. 导出为`csv`格式

### STEP2 格式处理

使用`apple`的 `number表格` 删除B列，保留`[翻译]`这一列，同时务必确保只有`name`和 `trans`这两列
保存导出为`csv`格式
### STEP3 csv to json

工具：`https://csvjson.com/csv2json`
进行格式转换，保存`json`文件

### STEP4 最后的处理

在`vscode` 中打开该`json`文件
使用查找替换，将`"[`、 `]"` 替换为 `["` 、`"]`
保存

### STEP5 导入项目文件
将该`json`文件导入到`/public/dicts`中
同时修改`/resources/dictionary.ts`
修改格式为：

```json
{ id: 'test', name: 'test', description: 'test', category: '英语学习', url: './dicts/test.json', length: 0 },
```
#### 注意
`length`该字段可以使用`node ./scripts/update-dict-size.js`来进行统计

## 项目参数

默认端口`3000`
`Local:http://localhost:3000`
## 疑难杂症

### yarn start失败
> 报错：ERR_PACKAGE_PATH_NOT_EXPORTED

尝试删除 `node_modules` 重新`yarn`安装依赖，然后再 `yarn start` 

如果还是失败，请确保`node`版本一致，自行修改当前版本
