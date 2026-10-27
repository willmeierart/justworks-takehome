import { describe, expect, it } from 'vitest'

import { easeOutCubic, tween } from './tween'

describe('tween', () => {
  it('starts at the previous value and ends on the next one', () => {
    expect(tween(10, 20, 0)).toBe(10)
    expect(tween(10, 20, 1)).toBe(20)
  })

  it('eases out so the first half covers more than half the distance', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
    expect(tween(0, 100, 0.5)).toBeGreaterThan(50)
  })
})
