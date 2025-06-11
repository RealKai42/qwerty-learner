<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress" :style="{ width: `${progress}%` }"></div>
    </div>
    <div class="progress-text">
      {{ currentIndex + 1 }} / {{ totalWords }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useWordStore } from '../../stores/word'

const wordStore = useWordStore()
const progress = computed(() => (wordStore.currentIndex / wordStore.totalWords) * 100)
const currentIndex = computed(() => wordStore.currentIndex)
const totalWords = computed(() => wordStore.totalWords)
</script>

<style scoped>
.progress-container {
  @apply flex flex-col items-center gap-2;
}

.progress-bar {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress {
  @apply h-full bg-green-500 transition-all duration-300;
}

.progress-text {
  @apply text-sm text-gray-400;
}
</style>