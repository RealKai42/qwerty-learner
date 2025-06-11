<template>
  <div class="word-page">
    <WordProgress class="mb-8" />
    <TypingArea class="mb-8" />
    <WordList />
  </div>
</template>

<script setup>
import WordProgress from '../components/word/WordProgress.vue'
import TypingArea from '../components/typing/TypingArea.vue'
import WordList from '../components/word/WordList.vue'
</script>

<style scoped>
.word-page {
  @apply min-h-screen bg-[#1A1B1E] p-8 flex flex-col items-center;
}
</style>