import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import words from '../data/words.json'
import { shuffle } from '../utils/shuffle'
import { storageService } from '../services/storageService'

export const useWordStore = defineStore('word', () => {
  // 从 localStorage 获取保存的进度
  const savedProgress = storageService.getProgress()
  
  const wordList = ref(savedProgress?.wordList || shuffle(words))
  const currentIndex = ref(savedProgress?.currentIndex || 0)
  const typedChars = ref([])
  const errors = ref(0)
  
  const currentWord = computed(() => wordList.value[currentIndex.value] || {
    name: '',
    usphone: '',
    trans: []
  })
  
  const totalWords = computed(() => wordList.value.length)
  const progress = computed(() => (currentIndex.value / totalWords.value) * 100)
  
  // 监听进度变化并保存
  watch([wordList, currentIndex], () => {
    storageService.saveProgress({
      wordList: wordList.value,
      currentIndex: currentIndex.value
    })
  })
  
  function nextWord() {
    if (currentIndex.value < wordList.value.length - 1) {
      currentIndex.value++
    } else {
      wordList.value = shuffle(words)
      currentIndex.value = 0
    }
    typedChars.value = []
  }
  
  function reset() {
    wordList.value = shuffle(words)
    currentIndex.value = 0
    typedChars.value = []
    errors.value = 0
    storageService.clearProgress()
  }
  
  return {
    currentWord,
    progress,
    totalWords,
    currentIndex,
    typedChars,
    errors,
    nextWord,
    reset
  }
})