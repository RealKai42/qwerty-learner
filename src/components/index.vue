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

// 创建音频上下文
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const sounds = new Map()

// 加载音频文件
const loadSound = async (url) => {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    return audioBuffer
  } catch (error) {
    console.error('Failed to load sound:', error)
    return null
  }
}

// 播放音频
const playSound = (buffer) => {
  if (!buffer) return
  
  const source = audioContext.createBufferSource()
  source.buffer = buffer
  source.connect(audioContext.destination)
  source.start(0)
}

// 预加载音效
onMounted(async () => {
  try {
    const [keyboardBuffer, errorBuffer] = await Promise.all([
      loadSound('/sounds/keyboard.mp3'),
      loadSound('/sounds/error.mp3')
    ])
    sounds.set('keyboard', keyboardBuffer)
    sounds.set('error', errorBuffer)
  } catch (error) {
    console.error('Failed to preload sounds:', error)
  }

  window.addEventListener('keydown', handleKeydown)
})

const store = useTypingStore()
const inputWord = ref('')
const wordCardRef = ref(null)
const typedResult = ref([])

const isCorrect = computed(() => {
  return inputWord.value === store.currentWord.name
})

const playKeySound = () => {
  playSound(sounds.get('keyboard'))
}

const playErrorSound = () => {
  playSound(sounds.get('error'))
}

const createJumpAnimation = (element) => {
  element.style.animation = 'none'
  element.offsetHeight
  element.style.animation = 'jump 0.2s ease'
}

const handleKeydown = (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return
  
  // 确保音频上下文是激活的
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  
  if (event.key.length === 1) {
    if (/^[a-zA-Z\-']$/.test(event.key)) {
      const inputChar = event.key.toLowerCase()
      const currentIndex = inputWord.value.length
      const correctChar = store.currentWord.name[currentIndex]
      
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
      typedResult.value.pop()
    }
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  audioContext.close()
})
</script>