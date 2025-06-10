<template>
  <div class="h-screen bg-[#1A1B1E] flex items-center justify-center">
    <div class="flex flex-col items-center">
      <WordCard 
        :word="store.currentWord" 
        :typedChars="typedResult"
        ref="wordCardRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTypingStore } from '../stores/typing'
import WordCard from './WordCard.vue'

const store = useTypingStore()
const inputWord = ref('')
const wordCardRef = ref(null)

// 存储每个字符的输入结果，包括正确和错误的字符
const typedResult = ref([])

const isCorrect = computed(() => {
  return inputWord.value === store.currentWord.name
})

const playKeySound = () => {
  const audio = new Audio('/sounds/keyboard.mp3')
  audio.volume = 1
  audio.play().catch(() => {})
}

const playErrorSound = () => {
  const audio = new Audio('/sounds/error.mp3')
  audio.volume = 1
  audio.play().catch(() => {})
}

const createJumpAnimation = (element) => {
  element.style.animation = 'none'
  element.offsetHeight
  element.style.animation = 'jump 0.2s ease'
}

const handleKeydown = (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return
  
  if (event.key.length === 1) {
    if (/^[a-zA-Z\-']$/.test(event.key)) {
      const inputChar = event.key.toLowerCase()
      const currentIndex = inputWord.value.length
      const correctChar = store.currentWord.name[currentIndex]
      
      // 记录输入的字符
      typedResult.value[currentIndex] = inputChar

      if (correctChar === inputChar) {
        playKeySound()
        const chars = wordCardRef.value?.chars
        if (chars && chars[currentIndex]) {
          createJumpAnimation(chars[currentIndex])
        }
        inputWord.value += inputChar

        if (isCorrect.value) {
          setTimeout(() => {
            inputWord.value = ''
            typedResult.value = []
            store.nextWord()
          }, 300)
        }
      } else {
        playErrorSound()
      }
    }
  } else if (event.key === 'Backspace') {
    if (inputWord.value.length > 0) {
      playKeySound()
      inputWord.value = inputWord.value.slice(0, -1)
      typedResult.value.pop() // 删除最后一个输入结果
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>