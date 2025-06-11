import { ref, computed } from 'vue'

export function useTyping() {
  const inputState = ref('')
  const typedChars = ref([])
  
  const handleInput = (char) => {
    const currentIndex = inputState.value.length
    typedChars.value[currentIndex] = char
    if (isValidInput(char)) {
      inputState.value += char
    }
  }
  
  const handleBackspace = () => {
    if (inputState.value.length > 0) {
      inputState.value = inputState.value.slice(0, -1)
      typedChars.value.pop()
    }
  }
  
  const isValidInput = (char) => {
    return /^[a-zA-Z\-']$/.test(char)
  }

  const reset = () => {
    inputState.value = ''
    typedChars.value = []
  }
  
  return {
    inputState,
    typedChars,
    handleInput,
    handleBackspace,
    reset
  }
}