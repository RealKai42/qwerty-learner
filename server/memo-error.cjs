class MemoError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.status = status
  }
}

module.exports = { MemoError }
