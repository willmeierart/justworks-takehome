import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls the function once after the wait, with the last arguments', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 400)

    debounced('a')
    debounced('b')
    debounced('c')

    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(399)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })

  it('cancel prevents a pending call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 400)

    debounced('x')
    debounced.cancel()
    vi.advanceTimersByTime(400)

    expect(fn).not.toHaveBeenCalled()
  })
})
