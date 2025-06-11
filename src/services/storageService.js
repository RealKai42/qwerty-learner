const STORAGE_KEY = 'qwerty-learner-'

export const storageService = {
  saveProgress(data) {
    localStorage.setItem(STORAGE_KEY + 'progress', JSON.stringify({
      currentIndex: data.currentIndex,
      wordList: data.wordList,
      timestamp: Date.now()
    }))
  },
  
  getProgress() {
    const data = localStorage.getItem(STORAGE_KEY + 'progress')
    if (!data) return null
    
    try {
      const parsed = JSON.parse(data)
      // 检查数据是否过期（例如7天）
      if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY + 'progress')
        return null
      }
      return parsed
    } catch {
      return null
    }
  },

  clearProgress() {
    localStorage.removeItem(STORAGE_KEY + 'progress')
  }
}