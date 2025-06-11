<template>
  <div class="typing-container">
    <WordCard
      :word="store.currentWord"
      :typedChars="typedResult"
      ref="wordCardRef"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useWordStore } from '../../stores/word'
import WordCard from '../word/WordCard.vue'
import { useSound } from '../../composables/useSound'
import { useAnimation } from '../../composables/useAnimation'

const store = useWordStore()
const typedResult = ref([])
const wordCardRef = ref(null)
const { playKeySound, playErrorSound } = useSound()
const { jump } = useAnimation()

// 监听单词切换，重置typedResult
watch(
  () => store.currentWord,
  () => {
    typedResult.value = []
  },
  { immediate: true }
)
</script>

<style scoped>
.typing-container {
  @apply flex flex-col items-center justify-center;
}
</style>