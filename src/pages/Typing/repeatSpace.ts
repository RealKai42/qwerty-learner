let ignoreSpace = false
let timer = 0

function clearIgnoredRepeatSpace() {
  ignoreSpace = false
  window.clearTimeout(timer)
  window.removeEventListener('keyup', onKeyUp, true)
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key !== ' ' && event.code !== 'Space') return
  clearIgnoredRepeatSpace()
}

// The space that restarts a chapter can still reach the new word. Firefox
// may deliver it again after focus moves to the typing field.
export function beginIgnoringRepeatSpace() {
  if (!ignoreSpace) {
    window.addEventListener('keyup', onKeyUp, true)
  }
  ignoreSpace = true
  window.clearTimeout(timer)
  timer = window.setTimeout(clearIgnoredRepeatSpace, 1000)
}

export function isRepeatSpacePending() {
  return ignoreSpace
}
