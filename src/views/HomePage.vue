<template>
  <div class="h-screen bg-[#1A1B1E]">
    <div class="container mx-auto flex flex-col items-center h-full"> <!-- 移除 justify-center -->
      <div class="progress-bar mb-8 mt-20"> <!-- 设置顶部外边距为 0 -->
        <div class="progress-bg">
          <div 
            class="progress-fill"
            :style="{ width: `${store.progress}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ Math.round(store.progress) }}% ({{ store.currentIndex + 1 }} / {{ store.totalWords }})
        </div>
      </div>
      <TypingArea />
    </div>
  </div>
</template>

<script setup>
import { useWordStore } from '../stores/word'
import TypingArea from '../components/typing/TypingArea.vue'

const store = useWordStore()
</script>

<style scoped>
.container {
  @apply max-w-4xl px-4;
}

.progress-bar {
  @apply w-full max-w-md;
}

.progress-bg {
  @apply w-full h-1 bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-green-500 transition-all duration-300 ease-out;
}

.progress-text {
  @apply text-xs text-gray-400 mt-2 text-center;
}
</style>