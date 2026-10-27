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

export function formatUnitPrice(
  rate: number | null | undefined,
  currency: FiatCurrency,
): string | null {
  if (rate == null || !Number.isFinite(rate) || rate <= 0) {
    return null
  }
  return formatFiat(1 / rate, currency)
}

export function parseAmountInput(raw: string): number | null {
  const stripped = raw.replace(/,/g, '').trim()
  if (stripped === '' || stripped === '.') {
    return null
  }
  const parsed = Number(stripped)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }
  return parsed
}

export function formatAmountInput(raw: string): string {
  const digits = raw.replace(/[^\d.]/g, '')
  if (digits === '') {
    return ''
  }

  const dot = digits.indexOf('.')
  const hasDot = dot !== -1
  const wholeRaw = hasDot ? digits.slice(0, dot) : digits
  const fraction = hasDot
    ? digits
        .slice(dot + 1)
        .replace(/\./g, '')
        .slice(0, 2)
    : ''
  const wholeDigits = wholeRaw.replace(/^0+(?=\d)/, '')
  const whole = wholeDigits === '' ? '0' : wholeDigits
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return hasDot ? `${grouped}.${fraction}` : grouped
}

export function currencySymbol(currency: FiatCurrency): string {
  return { USD: '$', EUR: '�', GBP: '�' }[currency]
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
