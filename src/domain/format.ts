import { FIAT_UNITS, type CryptoAsset, type FiatCurrency } from './types'

export function localeFor(currency: FiatCurrency): string {
  return FIAT_UNITS[currency].locale
}

export function separatorsFor(currency: FiatCurrency): { group: string; decimal: string } {
  const parts = new Intl.NumberFormat(localeFor(currency)).formatToParts(1234.5)
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
  }
}

const fiatFormatters = new Map<FiatCurrency, Intl.NumberFormat>()

function fiatFormatter(currency: FiatCurrency): Intl.NumberFormat {
  const existing = fiatFormatters.get(currency)
  if (existing) {
    return existing
  }

  const formatter = new Intl.NumberFormat(localeFor(currency), {
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

function normalizeAmountRaw(raw: string, currency: FiatCurrency): string {
  const { group, decimal } = separatorsFor(currency)
  let seenDecimal = false
  let out = ''
  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      out += char
      continue
    }
    if (char === decimal && !seenDecimal) {
      out += '.'
      seenDecimal = true
    }
    if (char === group) {
      continue
    }
  }
  return out
}

export function parseAmountInput(raw: string, currency: FiatCurrency = 'USD'): number | null {
  const stripped = normalizeAmountRaw(raw, currency)
  if (stripped === '' || stripped === '.') {
    return null
  }
  const parsed = Number(stripped)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }
  return parsed
}

export function formatAmountInput(raw: string, currency: FiatCurrency = 'USD'): string {
  const { group, decimal } = separatorsFor(currency)
  const normalized = normalizeAmountRaw(raw, currency)
  if (normalized === '') {
    return ''
  }

  const dot = normalized.indexOf('.')
  const hasDot = dot !== -1
  const wholeRaw = hasDot ? normalized.slice(0, dot) : normalized
  const fraction = hasDot ? normalized.slice(dot + 1).slice(0, 2) : ''
  const wholeDigits = wholeRaw.replace(/^0+(?=\d)/, '')
  const whole = wholeDigits === '' ? '0' : wholeDigits
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group)

  return hasDot ? `${grouped}${decimal}${fraction}` : grouped
}

export function formatAmountFromNumber(amount: number, currency: FiatCurrency): string {
  const { decimal } = separatorsFor(currency)
  const raw = String(amount).replace('.', decimal)
  return formatAmountInput(raw, currency)
}

/** Digits only, clamped to 0-100. Empty while the field is being cleared. */
export function sanitizePercentDraft(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 3)
  if (digits === '') {
    return ''
  }
  return String(Math.min(100, Number(digits)))
}

/** Place a caret from `source` onto `formatted`, counting digits and decimal marks. */
export function caretAfterKeptChars(
  formatted: string,
  source: string,
  caret: number,
  decimal = '.',
): number {
  const kept = source
    .slice(0, Math.max(0, caret))
    .split('')
    .filter((char) => char === decimal || (char >= '0' && char <= '9'))
    .join('')
  if (kept.length === 0) {
    return 0
  }

  let seen = 0
  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i] ?? ''
    if (char === decimal || (char >= '0' && char <= '9')) {
      seen++
    }
    if (seen === kept.length) {
      return i + 1
    }
  }
  return formatted.length
}

const cryptoFormatters = new Map<string, Intl.NumberFormat>()

function cryptoFormatter(asset: CryptoAsset, currency: FiatCurrency): Intl.NumberFormat {
  const key = `${currency}:${asset}`
  const existing = cryptoFormatters.get(key)
  if (existing) return existing

  const fractionDigits = asset === 'BTC' ? 8 : 6
  const formatter = new Intl.NumberFormat(localeFor(currency), {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  })
  cryptoFormatters.set(key, formatter)
  return formatter
}

export function formatCrypto(
  amount: number,
  asset: CryptoAsset,
  currency: FiatCurrency = 'USD',
): string {
  return `${cryptoFormatter(asset, currency).format(amount)} ${asset}`
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
