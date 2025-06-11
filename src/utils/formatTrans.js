export function formatTrans(trans) {
  if (!trans?.length) return []
  
  // 处理第一个翻译（通常只有一个翻译）
  const text = trans[0]
  
  // 使用正则表达式匹配不同词性的定义
  // 匹配 "n." "vt." "vi." "adj." 等词性标记
  const parts = text.split(/(?=[a-z]+\.)/)
  
  // 清理每个部分的空白字符
  return parts.map(part => part.trim())
}