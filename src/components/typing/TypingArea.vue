<template>
  <div 
    class="typing-area" 
    tabindex="0" 
    ref="areaRef"
    @keydown="handleKeydown"
    @blur="handleBlur"
  >
    <div class="word-container">
      <WordCard
        :word="store.currentWord"
        :typedChars="store.typedChars"
        :currentIndex="inputState.length"
        ref="wordCardRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWordStore } from '../../stores/word'
import WordCard from '../word/WordCard.vue'
import { useTyping } from '../../composables/useTyping'
import { useSound } from '../../composables/useSound'
import { useAnimation } from '../../composables/useAnimation'

const store = useWordStore()
const areaRef = ref(null)
const wordCardRef = ref(null)
const { inputState, handleInput, handleBackspace, reset } = useTyping()
const { playKeySound, playErrorSound, speakWord } = useSound()
const { jump, shake } = useAnimation()

// 监听当前单词变化，自动朗读
watch(
  () => store.currentWord,
  (newWord) => {
    if (newWord?.name) {
      speakWord(newWord.name)
    }
  },
  { immediate: true }
)

const handleKeydown = (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return
  
  if (event.key.length === 1) {
    if (/^[a-zA-Z\-']$/.test(event.key)) {
      const inputChar = event.key.toLowerCase()
      const correctChar = store.currentWord.name[inputState.value.length]?.toLowerCase()
      
      if (correctChar) {
        handleInput(inputChar)
        store.typedChars[inputState.value.length - 1] = inputChar

        if (inputChar === correctChar) {
          playKeySound()
          const chars = wordCardRef.value?.chars
          if (chars && chars[inputState.value.length - 1]) {
            jump(chars[inputState.value.length - 1])
          }

          if (inputState.value === store.currentWord.name) {
            setTimeout(() => {
              reset()
              store.nextWord()
            }, 300)
          }
        } else {
          playErrorSound()
          if (wordCardRef.value?.chars[inputState.value.length - 1]) {
            shake(wordCardRef.value.chars[inputState.value.length - 1])
          }
          store.increaseErrors()
        }
      }
    }
  } else if (event.key === 'Backspace') {
    if (inputState.value.length > 0) {
      playKeySound()
      handleBackspace()
      store.typedChars.pop()
    }
  }
}

// 处理失去焦点的情况
const handleBlur = () => {
  setTimeout(() => {
    areaRef.value?.focus()
  }, 0)
}

// 组件挂载时自动获取焦点
onMounted(() => {
  areaRef.value?.focus()
})
</script>

<style scoped>
.typing-area {
  @apply w-full outline-none flex items-center justify-center;
}

.word-container {
  @apply flex flex-col items-center justify-center;
}
</style>