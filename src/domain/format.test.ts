import { describe, expect, it } from 'vitest'

import {
  caretAfterKeptChars,
  formatAmountFromNumber,
  formatAmountInput,
  formatCrypto,
  formatFiat,
  formatLastRefreshed,
  formatUnitPrice,
  parseAmountInput,
  sanitizePercentDraft,
  separatorsFor,
} from './format'

describe('formatFiat', () => {
  it('uses the locale that belongs to the currency', () => {
    expect(formatFiat(1234.5, 'USD')).toBe('$1,234.50')
    expect(formatFiat(1234.5, 'EUR')).toMatch(/1\.234,50/)
    expect(formatFiat(1234.5, 'GBP')).toMatch(/1,234\.50/)
  })
})

describe('formatCrypto', () => {
  it('keeps small BTC amounts visible', () => {
    expect(formatCrypto(0.00001241, 'BTC', 'USD')).toContain('0.00001241')
    expect(formatCrypto(0.00001241, 'BTC', 'USD')).toContain('BTC')
  })

  it('formats ETH with up to 6 fraction digits', () => {
    expect(formatCrypto(1.23456789, 'ETH', 'USD')).toBe('1.234568 ETH')
  })

  it('groups crypto with the selected currency locale', () => {
    expect(formatCrypto(1234.5, 'ETH', 'EUR')).toMatch(/1\.234,5/)
  })
})

describe('amount input grouping', () => {
  it('inserts commas while keeping a trailing decimal in USD', () => {
    expect(formatAmountInput('10000', 'USD')).toBe('10,000')
    expect(formatAmountInput('10,000', 'USD')).toBe('10,000')
    expect(formatAmountInput('10000.', 'USD')).toBe('10,000.')
    expect(formatAmountInput('10000.5', 'USD')).toBe('10,000.5')
    expect(formatAmountInput('10000.56', 'USD')).toBe('10,000.56')
  })

  it('uses period groups and a comma decimal for EUR', () => {
    expect(formatAmountInput('10000', 'EUR')).toBe('10.000')
    expect(formatAmountInput('10000,', 'EUR')).toBe('10.000,')
    expect(formatAmountInput('10000,5', 'EUR')).toBe('10.000,5')
    expect(parseAmountInput('10.000,50', 'EUR')).toBe(10000.5)
  })

  it('drops letters and keeps one decimal', () => {
    expect(formatAmountInput('10a00', 'USD')).toBe('1,000')
    expect(formatAmountInput('12abc.3x4', 'USD')).toBe('12.34')
    expect(formatAmountInput('1e2', 'USD')).toBe('12')
    expect(formatAmountInput('abc', 'USD')).toBe('')
  })

  it('parses grouped values back to a number', () => {
    expect(parseAmountInput('10,000', 'USD')).toBe(10000)
    expect(parseAmountInput('10,000.50', 'USD')).toBe(10000.5)
    expect(parseAmountInput('', 'USD')).toBeNull()
  })

  it('rewrites a stored number into the currency locale', () => {
    expect(formatAmountFromNumber(10000.5, 'USD')).toBe('10,000.5')
    expect(formatAmountFromNumber(10000.5, 'EUR')).toBe('10.000,5')
  })
})

describe('formatUnitPrice', () => {
  it('inverts crypto-per-fiat into fiat per coin', () => {
    expect(formatUnitPrice(0.00002, 'USD')).toMatch(/50,000/)
    expect(formatUnitPrice(null, 'USD')).toBeNull()
  })
})

describe('sanitizePercentDraft', () => {
  it('keeps digits and clamps to 0-100', () => {
    expect(sanitizePercentDraft('50a')).toBe('50')
    expect(sanitizePercentDraft('abc')).toBe('')
    expect(sanitizePercentDraft('150')).toBe('100')
    expect(sanitizePercentDraft('007')).toBe('7')
  })
})

describe('caretAfterKeptChars', () => {
  it('lands on the same digit after commas are inserted', () => {
    expect(caretAfterKeptChars('1,000', '1000', 4)).toBe(5)
    expect(caretAfterKeptChars('1,000', '1a000', 2)).toBe(1)
  })

  it('treats a locale decimal as a kept character', () => {
    expect(caretAfterKeptChars('10.000,5', '10000,5', 6, ',')).toBe(7)
    expect(separatorsFor('EUR').decimal).toBe(',')
  })
})

describe('formatLastRefreshed', () => {
  const now = Date.parse('2026-10-27T17:00:00Z')

  it('stays on just now until the nearest minute', () => {
    expect(formatLastRefreshed(now - 10_000, now)).toBe('just now')
    expect(formatLastRefreshed(now - 44_000, now)).toBe('just now')
    expect(formatLastRefreshed(now + 5_000, now)).toBe('just now')
  })

  it('rounds to minutes, then hours, then days', () => {
    expect(formatLastRefreshed(now - 46_000, now)).toBe('1 minute ago')
    expect(formatLastRefreshed(now - 4 * 60_000, now)).toBe('4 minutes ago')
    expect(formatLastRefreshed(now - 59 * 60_000, now)).toBe('59 minutes ago')
    expect(formatLastRefreshed(now - 70 * 60_000, now)).toBe('over one hour ago')
    expect(formatLastRefreshed(now - 2 * 60 * 60_000, now)).toBe('2 hours ago')
    expect(formatLastRefreshed(now - 26 * 60 * 60_000, now)).toBe('one day ago')
    expect(formatLastRefreshed(now - 3 * 24 * 60 * 60_000, now)).toBe('3 days ago')
  })
})
