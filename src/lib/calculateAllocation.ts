import type { ExchangeRates } from './types'

export type Allocation = {
  btcFiat: number
  ethFiat: number
  btcCrypto: number | null
  ethCrypto: number | null
}

export function calculateAllocation(
  amount: number,
  btcPercent: number,
  rates: ExchangeRates | null,
): Allocation {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0
  const clamped = Math.min(100, Math.max(0, btcPercent))
  const btcFiat = safeAmount * (clamped / 100)
  const ethFiat = safeAmount * ((100 - clamped) / 100)

  if (!rates || !Number.isFinite(rates.BTC) || !Number.isFinite(rates.ETH)) {
    return { btcFiat, ethFiat, btcCrypto: null, ethCrypto: null }
  }

  return {
    btcFiat,
    ethFiat,
    btcCrypto: btcFiat * rates.BTC,
    ethCrypto: ethFiat * rates.ETH,
  }
}
