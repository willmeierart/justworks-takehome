import { FIAT_CURRENCIES, type FiatCurrency, type Holdings } from './types'

export const HOLDINGS_STORAGE_KEY = 'holdings-split-v2'
export const DEFAULT_BTC_PERCENT = 50

export const defaultHoldings: Holdings = {
  amount: null,
  currency: 'USD',
  btcPercent: DEFAULT_BTC_PERCENT,
}

function isFiatCurrency(value: unknown): value is FiatCurrency {
  return typeof value === 'string' && (FIAT_CURRENCIES as readonly string[]).includes(value)
}

function isValidAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isValidPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

export function parseHoldings(raw: string | null): Holdings {
  if (raw == null || raw === '') {
    return { ...defaultHoldings }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed == null || typeof parsed !== 'object') {
      return { ...defaultHoldings }
    }

    const record = parsed as Record<string, unknown>
    const amount =
      record.amount === null ? null : isValidAmount(record.amount) ? record.amount : null
    const currency = isFiatCurrency(record.currency) ? record.currency : defaultHoldings.currency
    const btcPercent = isValidPercent(record.btcPercent)
      ? record.btcPercent
      : defaultHoldings.btcPercent

    return { amount, currency, btcPercent }
  } catch {
    return { ...defaultHoldings }
  }
}

export function serializeHoldings(holdings: Holdings): string {
  return JSON.stringify({
    amount: holdings.amount,
    currency: holdings.currency,
    btcPercent: holdings.btcPercent,
  })
}
