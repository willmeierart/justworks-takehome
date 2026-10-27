import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, onUnmounted, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { fetchExchangeRates } from '@/lib/coinbase'
import { debounce } from '@/lib/debounce'
import { RATES_STALE_TIME_MS } from '@/lib/queryClient'
import type { FiatCurrency } from '@/lib/types'

export const RATES_QUERY_KEY = 'exchange-rates'
export const AMOUNT_REFETCH_DEBOUNCE_MS = 400

export function exchangeRatesQueryKey(currency: FiatCurrency) {
  return [RATES_QUERY_KEY, currency] as const
}

export function useExchangeRates(
  currency: MaybeRefOrGetter<FiatCurrency>,
  amount: MaybeRefOrGetter<number | null>,
) {
  const queryClient = useQueryClient()
  const currencyValue = computed(() => toValue(currency))

  const query = useQuery({
    queryKey: computed(() => exchangeRatesQueryKey(currencyValue.value)),
    queryFn: ({ signal }) => fetchExchangeRates(currencyValue.value, signal),
    staleTime: RATES_STALE_TIME_MS,
  })

  function refetchCurrent() {
    void queryClient.invalidateQueries({
      queryKey: exchangeRatesQueryKey(currencyValue.value),
    })
  }

  const debouncedRefetch = debounce(refetchCurrent, AMOUNT_REFETCH_DEBOUNCE_MS)

  watch(
    () => toValue(amount),
    () => {
      debouncedRefetch()
    },
  )

  onUnmounted(() => {
    debouncedRefetch.cancel()
  })

  return {
    rates: computed(() => query.data.value ?? null),
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    dataUpdatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
  }
}
