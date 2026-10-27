export const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP'] as const

export type FiatCurrency = (typeof FIAT_CURRENCIES)[number]

export const FIAT_UNITS: Record<FiatCurrency, { symbol: string; code: string }> = {
  USD: { symbol: '$', code: 'USD' },
  EUR: { symbol: '\u20AC', code: 'EUR' },
  GBP: { symbol: '\u00A3', code: 'GBP' },
}

export const CRYPTO_ASSETS = ['BTC', 'ETH'] as const

export type CryptoAsset = (typeof CRYPTO_ASSETS)[number]

export type ExchangeRates = {
  currency: FiatCurrency
  BTC: number
  ETH: number
}

export type Holdings = {
  amount: number | null
  currency: FiatCurrency
  btcPercent: number
}
