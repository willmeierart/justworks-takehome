import { describe, expect, it } from 'vitest'

import {
  defaultHoldings,
  parseHoldings,
  readStorage,
  serializeHoldings,
  writeStorage,
} from './persist'

describe('parseHoldings', () => {
  it('returns defaults for null, empty, or non-json payloads', () => {
    expect(parseHoldings(null)).toEqual(defaultHoldings)
    expect(parseHoldings('')).toEqual(defaultHoldings)
    expect(parseHoldings('{not json')).toEqual(defaultHoldings)
    expect(parseHoldings('[]')).toEqual(defaultHoldings)
  })

  it('hydrates a valid payload', () => {
    expect(parseHoldings('{"amount":2500,"currency":"EUR","btcPercent":40}')).toEqual({
      amount: 2500,
      currency: 'EUR',
      btcPercent: 40,
    })
  })

  it('falls back field-by-field on corrupt values', () => {
    expect(parseHoldings('{"amount":-12,"currency":"JPY","btcPercent":140}')).toEqual({
      amount: null,
      currency: 'USD',
      btcPercent: 70,
    })
  })

  it('readStorage and writeStorage survive a blocked store', () => {
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked')
      },
    })
    expect(readStorage('holdings-split-v2')).toBeNull()
    expect(() => writeStorage('holdings-split-v2', '{}')).not.toThrow()
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original,
    })
  })

  it('round-trips through serializeHoldings', () => {
    const holdings = { amount: 80, currency: 'GBP' as const, btcPercent: 25 }
    expect(parseHoldings(serializeHoldings(holdings))).toEqual(holdings)
  })
})
