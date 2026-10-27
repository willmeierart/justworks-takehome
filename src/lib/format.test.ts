import { describe, expect, it } from 'vitest'

import {
  formatAmountInput,
  formatCrypto,
  formatFiat,
  formatPercent,
  formatUnitPrice,
  parseAmountInput,
} from './format'

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

describe('amount input grouping', () => {
  it('inserts commas while keeping a trailing decimal', () => {
    expect(formatAmountInput('10000')).toBe('10,000')
    expect(formatAmountInput('10,000')).toBe('10,000')
    expect(formatAmountInput('10000.')).toBe('10,000.')
    expect(formatAmountInput('10000.5')).toBe('10,000.5')
    expect(formatAmountInput('10000.56')).toBe('10,000.56')
  })

  it('parses grouped values back to a number', () => {
    expect(parseAmountInput('10,000')).toBe(10000)
    expect(parseAmountInput('10,000.50')).toBe(10000.5)
    expect(parseAmountInput('')).toBeNull()
  })
})

describe('formatUnitPrice', () => {
  it('inverts crypto-per-fiat into fiat per coin', () => {
    expect(formatUnitPrice(0.00002, 'USD')).toMatch(/50,000/)
    expect(formatUnitPrice(null, 'USD')).toBeNull()
  })
})

describe('formatPercent', () => {
  it('rounds to a whole percent', () => {
    expect(formatPercent(70.4)).toBe('70%')
  })
})
