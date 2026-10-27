import { describe, expect, it } from 'vitest'

import { calculateAllocation } from './allocation'
import type { ExchangeRates } from './types'

const usdRates: ExchangeRates = {
  currency: 'USD',
  BTC: 0.00002,
  ETH: 0.0004,
}

describe('calculateAllocation', () => {
  it('splits 70/30 using crypto-per-fiat rates', () => {
    const result = calculateAllocation(10_000, 70, usdRates)

    expect(result.btcFiat).toBe(7000)
    expect(result.ethFiat).toBe(3000)
    expect(result.btcCrypto).toBeCloseTo(0.14)
    expect(result.ethCrypto).toBeCloseTo(1.2)
  })

  it('splits 50/50', () => {
    const result = calculateAllocation(200, 50, usdRates)

    expect(result.btcFiat).toBe(100)
    expect(result.ethFiat).toBe(100)
    expect(result.btcCrypto).toBeCloseTo(0.002)
    expect(result.ethCrypto).toBeCloseTo(0.04)
  })

  it('puts the full amount in BTC at 100/0', () => {
    const result = calculateAllocation(50, 100, usdRates)

    expect(result.btcFiat).toBe(50)
    expect(result.ethFiat).toBe(0)
    expect(result.btcCrypto).toBeCloseTo(0.001)
    expect(result.ethCrypto).toBe(0)
  })

  it('returns zeros for a zero amount', () => {
    const result = calculateAllocation(0, 70, usdRates)

    expect(result).toEqual({
      btcFiat: 0,
      ethFiat: 0,
      btcCrypto: 0,
      ethCrypto: 0,
    })
  })

  it('keeps fiat legs and nulls crypto when rates are missing', () => {
    const result = calculateAllocation(1000, 70, null)

    expect(result.btcFiat).toBe(700)
    expect(result.ethFiat).toBe(300)
    expect(result.btcCrypto).toBeNull()
    expect(result.ethCrypto).toBeNull()
  })

  it('treats a non-finite rate as missing', () => {
    const result = calculateAllocation(1000, 70, {
      currency: 'USD',
      BTC: Number.NaN,
      ETH: 0.0004,
    })

    expect(result.btcCrypto).toBeNull()
    expect(result.ethCrypto).toBeNull()
  })
})
