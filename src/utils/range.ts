const INFINITY = 1 / 0
const MAX_INTEGER = 1.7976931348623157e308

function toFinite(value: number): number {
  if (value === INFINITY || value === -INFINITY) {
    const sign = value < 0 ? -1 : 1
    return sign * MAX_INTEGER
  }
  return value === value ? value : 0
}

function baseRange(start: number, end: number, step: number): number[] {
  let index = -1
  let length = Math.max(Math.ceil((end - start) / (step || 1)), 0)
  const result = new Array<number>(length)

  while (length--) {
    result[++index] = start
    start += step
  }
  return result
}

export default function range(start: number, end: number, step: number): number[] {
  // Ensure the sign of `-0` is preserved.
  start = toFinite(start)
  if (end === undefined) {
    end = start
    start = 0
  } else {
    end = toFinite(end)
  }
  step = step === undefined ? (start < end ? 1 : -1) : toFinite(step)
  return baseRange(start, end, step)
}
