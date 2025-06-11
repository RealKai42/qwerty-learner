export function useSound() {
  const playKeySound = () => {
    const audio = new Audio('/sounds/keyboard.mp3')
    audio.volume = 1
    audio.play().catch(() => {})
  }

  const playErrorSound = () => {
    const audio = new Audio('/sounds/error.mp3')
    audio.volume = 1
    audio.play().catch(() => {})
  }

  const speakWord = (word) => {
    if (!word) return
    // 使用浏览器内置的语音合成API
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8 // 语速稍慢一点
    speechSynthesis.speak(utterance)
  }

  return {
    playKeySound,
    playErrorSound,
    speakWord
  }
}