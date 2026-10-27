import { describe, expect, it } from 'vitest'

import { formatCrypto, formatFiat, formatPercent } from './format'

describe('formatFiat', () => {
  it('uses the selected currency code', () => {
    expect(formatFiat(1234.5, 'USD')).toMatch(/1,234\.50/)
    expect(formatFiat(10, 'EUR')).toContain('10')
    expect(formatFiat(10, 'GBP')).toContain('10')
  })
})

describe('formatCrypto', () => {
  it('keeps small BTC amounts visible', () => {
    expect(formatCrypto(0.00001241, 'BTC')).toContain('0.00001241')
    expect(formatCrypto(0.00001241, 'BTC')).toContain('BTC')
  })

  it('formats ETH with up to 6 fraction digits', () => {
    expect(formatCrypto(1.23456789, 'ETH')).toBe('1.234568 ETH')
  })
})

describe('formatPercent', () => {
  it('rounds to a whole percent', () => {
    expect(formatPercent(70.4)).toBe('70%')
  })
})
