export type SpinOptions = {
  min: number
  max: number
  step: number
  shiftStep: number
  decimals?: number
}

export function rejectNonNumericInsert(event: InputEvent, decimal: string | null): void {
  if (event.inputType !== 'insertText' || !event.data) {
    return
  }
  if (decimal != null && event.data === decimal) {
    const input = event.target as HTMLInputElement
    if (input.value.includes(decimal)) {
      event.preventDefault()
    }
    return
  }
  if (/\D/.test(event.data)) {
    event.preventDefault()
  }
}

export function writeFormattedValue(
  input: HTMLInputElement,
  formatted: string,
  raw: string,
  caretAt: (formatted: string, raw: string, caret: number) => number,
): void {
  const caret = caretAt(formatted, raw, input.selectionStart ?? raw.length)
  input.value = formatted
  input.setSelectionRange(caret, caret)
}

export function spinFromKey(
  event: KeyboardEvent,
  current: number,
  options: SpinOptions,
): number | null {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
    return null
  }
  event.preventDefault()
  const step = event.shiftKey ? options.shiftStep : options.step
  const direction = event.key === 'ArrowUp' ? 1 : -1
  const next = current + direction * step
  const clamped = Math.min(options.max, Math.max(options.min, next))
  const decimals = options.decimals ?? 0
  const scale = 10 ** decimals
  return Math.round(clamped * scale) / scale
}
