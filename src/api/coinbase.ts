import { FIAT_CURRENCIES, type ExchangeRates, type FiatCurrency } from '@/domain/types'

const COINBASE_RATES_URL = 'https://api.coinbase.com/v2/exchange-rates'

export class CoinbaseRatesError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CoinbaseRatesError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object'
}

function parseRate(rates: Record<string, unknown>, asset: 'BTC' | 'ETH'): number {
  const raw = rates[asset]
  const numeric = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new CoinbaseRatesError(`Missing or invalid ${asset} rate`)
  }
  return numeric
}

export function parseExchangeRates(
  payload: unknown,
  expectedCurrency: FiatCurrency,
): ExchangeRates {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new CoinbaseRatesError('Unexpected Coinbase response shape')
  }

  const { currency, rates } = payload.data
  if (currency !== expectedCurrency) {
    throw new CoinbaseRatesError('Coinbase response currency did not match the request')
  }
  if (!isRecord(rates)) {
    throw new CoinbaseRatesError('Coinbase response is missing rates')
  }

  return {
    currency: expectedCurrency,
    BTC: parseRate(rates, 'BTC'),
    ETH: parseRate(rates, 'ETH'),
  }
}

export async function fetchExchangeRates(
  currency: FiatCurrency,
  signal?: AbortSignal,
): Promise<ExchangeRates> {
  if (!(FIAT_CURRENCIES as readonly string[]).includes(currency)) {
    throw new CoinbaseRatesError(`Unsupported currency: ${String(currency)}`)
  }

  const url = `${COINBASE_RATES_URL}?currency=${encodeURIComponent(currency)}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new CoinbaseRatesError(`Coinbase request failed (${response.status})`)
  }

  return parseExchangeRates(await response.json(), currency)
}
