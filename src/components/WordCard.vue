<template>
  <div class="word-display">
    <div class="word jumping-text cursor-pointer" @click="speak">
      <span
        v-for="(char, index) in wordName"
        :key="wordName + '-' + index"  
        :class="{
          'text-green-400': isCharCorrect(index),
          'error-blink': isCharError(index),
          'blink-cursor': !getTypedChar(index) && index === inputPosition && !hasError
        }"
        :ref="el => setCharRef(el, index)"
      >{{ char }}</span>
    </div>
    <div class="phonetic">{{ word?.usphone }}</div>
    <div class="translation">{{ word?.trans?.[0] }}</div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      usphone: '',
      trans: []
    })
  },
  typedChars: {
    type: Array,
    default: () => []
  }
})

const chars = ref([])
const setCharRef = (el, idx) => {
  if (el) chars.value[idx] = el
}

const wordName = computed(() => props.word?.name || '')

const inputPosition = computed(() => {
  for (let i = 0; i < wordName.value.length; i++) {
    if (!getTypedChar(i)) return i
  }
  return props.typedChars.length
})

const getTypedChar = idx => {
  const val = props.typedChars[idx]
  return typeof val === 'object' && val !== null ? val.char : val
}

const isCharCorrect = idx => {
  const val = props.typedChars[idx]
  if (typeof val === 'object' && val !== null) {
    return val.correct
  }
  return val === wordName.value[idx]
}

const isCharError = idx => {
  const val = props.typedChars[idx]
  if (typeof val === 'object' && val !== null) {
    return val.char && !val.correct
  }
  return val && val !== wordName.value[idx]
}

const hasError = computed(() => {
  return props.typedChars.some((char, idx) => {
    if (typeof char === 'object' && char !== null) {
      return char.char && !char.correct
    }
    return char && char !== wordName.value[idx]
  })
})

const speak = () => {
  speechSynthesis.cancel()
  if (props.word?.name) {
    const utterance = new SpeechSynthesisUtterance(props.word.name)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

watch(() => props.word?.name, (newWord) => {
  if (newWord) speak()
}, { immediate: true })

defineExpose({ chars })
</script>

<style scoped>
.word-display {
  @apply flex flex-col items-center justify-center text-center;
}
.word {
  @apply text-[96px] font-mono tracking-wider text-white mb-4;
}
.phonetic {
  @apply text-2xl text-gray-400 mb-3;
}
.translation {
  @apply text-2xl text-gray-300;
}
.jumping-text span {
  display: inline-block;
  transition: transform 0.2s ease;
}
@keyframes blink {
  0%, 100% { @apply text-white; }
  50% { @apply text-gray-800; }
}
@keyframes error-blink {
  0%, 100% { @apply text-red-500; }
  50% { @apply text-red-800; }
}
.blink-cursor {
  animation: blink 0.8s infinite;
}
.error-blink {
  animation: error-blink 0.8s infinite;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}
@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>