import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

import { fetchExchangeRates } from '@/api/coinbase'
import { RATES_STALE_TIME_MS } from '@/api/queryClient'
import type { FiatCurrency } from '@/domain/types'
import { debounce } from '@/lib/debounce'

export const RATES_QUERY_KEY = 'exchange-rates'
export const AMOUNT_REFETCH_DEBOUNCE_MS = 400

export function exchangeRatesQueryKey(currency: FiatCurrency) {
  return [RATES_QUERY_KEY, currency] as const
}

export function useExchangeRates(
  currency: Ref<FiatCurrency>,
  amount: MaybeRefOrGetter<number | null>,
) {
  const queryClient = useQueryClient()
  const lastGoodCurrency = ref(currency.value)

  const query = useQuery({
    queryKey: computed(() => exchangeRatesQueryKey(currency.value)),
    queryFn: ({ signal }) => fetchExchangeRates(currency.value, signal),
    staleTime: RATES_STALE_TIME_MS,
  })

  function refetchCurrent() {
    void queryClient.invalidateQueries({
      queryKey: exchangeRatesQueryKey(currency.value),
    })
  }

  const debouncedRefetch = debounce(refetchCurrent, AMOUNT_REFETCH_DEBOUNCE_MS)

  watch(
    () => toValue(amount),
    () => {
      debouncedRefetch()
    },
  )

  watch(
    () => query.data.value,
    (data) => {
      if (data) {
        lastGoodCurrency.value = data.currency
      }
    },
    { immediate: true },
  )

  watch(
    () => query.isError.value,
    (failed) => {
      if (failed && currency.value !== lastGoodCurrency.value) {
        currency.value = lastGoodCurrency.value
      }
    },
  )

  onScopeDispose(() => {
    debouncedRefetch.cancel()
  })

  return {
    rates: computed(() => query.data.value ?? null),
    isFetching: computed(() => query.isFetching.value),
    isError: computed(() => query.isError.value && currency.value === lastGoodCurrency.value),
    dataUpdatedAt: computed(() => query.dataUpdatedAt.value),
    refetch: query.refetch,
  }
}
