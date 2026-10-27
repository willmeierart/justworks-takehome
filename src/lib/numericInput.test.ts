import { describe, expect, it } from 'vitest'

import { spinFromKey } from './numericInput'

function key(name: string, shift = false): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: name, shiftKey: shift })
}

describe('spinFromKey', () => {
  it('steps by 1, or 10 with shift, and clamps', () => {
    expect(spinFromKey(key('ArrowUp'), 70, { min: 0, max: 100, step: 1, shiftStep: 10 })).toBe(71)
    expect(
      spinFromKey(key('ArrowDown', true), 70, { min: 0, max: 100, step: 1, shiftStep: 10 }),
    ).toBe(60)
    expect(spinFromKey(key('ArrowUp'), 100, { min: 0, max: 100, step: 1, shiftStep: 10 })).toBe(100)
    expect(spinFromKey(key('a'), 70, { min: 0, max: 100, step: 1, shiftStep: 10 })).toBeNull()
  })

  it('rounds amount steps to cents', () => {
    expect(
      spinFromKey(key('ArrowUp'), 1.1, {
        min: 0,
        max: 1_000_000,
        step: 1,
        shiftStep: 10,
        decimals: 2,
      }),
    ).toBe(2.1)
  })
})
