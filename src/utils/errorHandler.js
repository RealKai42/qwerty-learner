export const errorHandler = {
  handleApiError(error) {
    console.error('API Error:', error)
    return {
      message: '操作失败，请稍后重试',
      details: error.message
    }
  },

  handleAudioError(error) {
    console.warn('Audio Error:', error)
    return {
      message: '音频播放失败',
      details: error.message
    }
  },

  handleStorageError(error) {
    console.error('Storage Error:', error)
    return {
      message: '数据保存失败',
      details: error.message
    }
  }
}