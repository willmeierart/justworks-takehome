import type { CryptoAsset, FiatCurrency } from './types'

const fiatFormatters = new Map<FiatCurrency, Intl.NumberFormat>()

function fiatFormatter(currency: FiatCurrency): Intl.NumberFormat {
  const existing = fiatFormatters.get(currency)
  if (existing) {
    return existing
  }

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  })
  fiatFormatters.set(currency, formatter)
  return formatter
}

export function formatFiat(amount: number, currency: FiatCurrency): string {
  return fiatFormatter(currency).format(amount)
}

export function formatCrypto(amount: number, asset: CryptoAsset): string {
  const fractionDigits = asset === 'BTC' ? 8 : 6
  return `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  }).format(amount)} ${asset}`
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp)
}
