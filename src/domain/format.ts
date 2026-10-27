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

/** Digits only, clamped to 0-100. Empty while the field is being cleared. */
export function sanitizePercentDraft(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 3)
  if (digits === '') {
    return ''
  }
  return String(Math.min(100, Number(digits)))
}

/** Place a caret from `source` onto `formatted`, counting digits and decimal points. */
export function caretAfterKeptChars(formatted: string, source: string, caret: number): number {
  const kept = source.slice(0, Math.max(0, caret)).replace(/[^\d.]/g, '')
  if (kept.length === 0) {
    return 0
  }

  let seen = 0
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i] ?? ''
    if (char === '.' || (char >= '0' && char <= '9')) {
      seen++
    }
    if (seen === kept.length) {
      return i + 1
    }
  }
  return formatted.length
}

const cryptoFormatters = new Map<CryptoAsset, Intl.NumberFormat>()

function cryptoFormatter(asset: CryptoAsset): Intl.NumberFormat {
  const existing = cryptoFormatters.get(asset)
  if (existing) return existing

  const fractionDigits = asset === 'BTC' ? 8 : 6
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  })
  cryptoFormatters.set(asset, formatter)
  return formatter
}

export function formatCrypto(amount: number, asset: CryptoAsset): string {
  return `${cryptoFormatter(asset).format(amount)} ${asset}`
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

const MINUTE_S = 60
const HOUR_S = 60 * MINUTE_S
const DAY_S = 24 * HOUR_S

export function formatLastRefreshed(updatedAt: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - updatedAt) / 1000))

  if (seconds < 45) {
    return 'just now'
  }

  const minutes = Math.round(seconds / MINUTE_S)
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  }

  const hours = Math.round(seconds / HOUR_S)
  if (hours < 24) {
    return hours <= 1 ? 'over one hour ago' : `${hours} hours ago`
  }

  const days = Math.round(seconds / DAY_S)
  return days <= 1 ? 'one day ago' : `${days} days ago`
}
