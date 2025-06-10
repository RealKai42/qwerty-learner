<template>
  <div class="min-h-screen bg-[#1A1B1E] text-white flex flex-col items-center justify-center">
    <WordCard
      :word="store.currentWord"
      :typedChars="typedResult"
      ref="wordCardRef"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTypingStore } from '../../stores/modules/typing'
import WordCard from './WordCard.vue'

const store = useTypingStore()
const typedResult = ref([])
const wordCardRef = ref(null)

// 监听单词切换，重置typedResult
watch(
  () => store.currentWord,
  () => {
    typedResult.value = []
  },
  { immediate: true }
)
</script>