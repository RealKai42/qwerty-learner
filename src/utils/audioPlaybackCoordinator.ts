type StopPlayback = () => void

let currentWordStop: StopPlayback | null = null
let definitionCancel: StopPlayback | null = null

export function registerDefinitionCancel(cancel: StopPlayback): () => void {
  definitionCancel = cancel

  return () => {
    if (definitionCancel === cancel) {
      definitionCancel = null
    }
  }
}

export function stopDefinitionPlayback(): void {
  definitionCancel?.()
}

export function beginWordPlayback(stop: StopPlayback): void {
  stopDefinitionPlayback()

  if (currentWordStop && currentWordStop !== stop) {
    const previousStop = currentWordStop
    currentWordStop = null
    previousStop()
  }

  currentWordStop = stop
}

export function releaseWordPlayback(stop: StopPlayback): void {
  if (currentWordStop === stop) {
    currentWordStop = null
  }
}

export function stopWordPlayback(): void {
  if (!currentWordStop) return

  const stop = currentWordStop
  currentWordStop = null
  stop()
}

export function stopAllPlayback(): void {
  stopWordPlayback()
  stopDefinitionPlayback()
}
