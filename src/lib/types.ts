export const FIAT_CURRENCIES = ['USD', 'EUR', 'GBP'] as const

export type FiatCurrency = (typeof FIAT_CURRENCIES)[number]

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
