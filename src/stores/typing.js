import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import words from '../data/words.json'

// Fisher-Yates 洗牌算法
function shuffle(array) {
  let arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export const useTypingStore = defineStore('typing', () => {
  const currentWordIndex = ref(0)
  // 洗牌后的单词表
  const wordsList = ref(shuffle(words))

  // 当前单词，防止空数组越界
  const currentWord = computed(() => wordsList.value[currentWordIndex.value] || {
    name: '',
    usphone: '',
    trans: []
  })

  function nextWord() {
    if (currentWordIndex.value < wordsList.value.length - 1) {
      currentWordIndex.value++
    } else {
      // 一轮结束后重新洗牌
      wordsList.value = shuffle(words)
      currentWordIndex.value = 0
    }
  }

  function reset() {
    wordsList.value = shuffle(words)
    currentWordIndex.value = 0
  }

  return {
    currentWord,
    nextWord,
    reset,
    currentWordIndex,
    totalWords: computed(() => wordsList.value.length)
  }
})