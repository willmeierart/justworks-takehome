import { afterEach, describe, expect, it, vi } from 'vitest'

import { CoinbaseRatesError, fetchExchangeRates, parseExchangeRates } from './coinbase'

describe('parseExchangeRates', () => {
  it('reads BTC and ETH string rates', () => {
    expect(
      parseExchangeRates(
        {
          data: {
            currency: 'USD',
            rates: { BTC: '0.00001241', ETH: '0.00042577' },
          },
        },
        'USD',
      ),
    ).toEqual({
      currency: 'USD',
      BTC: 0.00001241,
      ETH: 0.00042577,
    })
  })

  it('rejects a missing BTC rate', () => {
    expect(() =>
      parseExchangeRates({ data: { currency: 'EUR', rates: { ETH: '0.0004' } } }, 'EUR'),
    ).toThrow(CoinbaseRatesError)
  })

  it('rejects a currency mismatch', () => {
    expect(() =>
      parseExchangeRates({ data: { currency: 'USD', rates: { BTC: '0.1', ETH: '0.2' } } }, 'GBP'),
    ).toThrow(/currency/)
  })
})

describe('fetchExchangeRates', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests the currency query and parses the body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { currency: 'GBP', rates: { BTC: '0.00001', ETH: '0.0003' } },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const controller = new AbortController()
    await expect(fetchExchangeRates('GBP', controller.signal)).resolves.toEqual({
      currency: 'GBP',
      BTC: 0.00001,
      ETH: 0.0003,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.coinbase.com/v2/exchange-rates?currency=GBP',
      { signal: controller.signal },
    )
  })

  it('throws on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    await expect(fetchExchangeRates('USD')).rejects.toThrow(/503/)
  })
})
