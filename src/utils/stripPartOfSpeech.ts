const partOfSpeechPrefix =
  /^(?:(?:n|v|adj|adv|pron|prep|conj|interj|aux|art|det|num|vt|vi|vtr|vitr|modal|abbr|phr)\.?\s*\/\s*)*(?:n|v|adj|adv|pron|prep|conj|interj|aux|art|det|num|vt|vi|vtr|vitr|modal|abbr|phr)\.\s*/i

export default function stripPartOfSpeech(text: string): string {
  return text
    .split(/([；;])/)
    .map((segment, index) => (index % 2 === 0 ? segment.replace(partOfSpeechPrefix, '').trim() : segment))
    .join('')
    .replace(/^(?:[；;]\s*)+/, '')
    .trim()
}
