<template>
  <div class="word-list">
    <div v-for="(word, index) in words" 
         :key="word.name + index"
         class="word-item"
         :class="{ 'current': index === currentIndex }">
      {{ word.name }}
    </div>
  </div>
</template>

<script setup>
import { useWordStore } from '../../stores/word'

const wordStore = useWordStore()
const { wordList: words, currentIndex } = wordStore

</script>

<style scoped>
.word-list {
  @apply flex flex-col gap-2 p-4;
}
.word-item {
  @apply p-2 rounded text-gray-400;
}
.current {
  @apply text-white bg-gray-800;
}
</style>