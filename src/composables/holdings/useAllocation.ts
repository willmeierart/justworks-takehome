import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { calculateAllocation } from '@/domain/allocation'
import type { ExchangeRates } from '@/domain/types'

export function useAllocation(
  amount: MaybeRefOrGetter<number | null>,
  btcPercent: MaybeRefOrGetter<number>,
  rates: MaybeRefOrGetter<ExchangeRates | null>,
) {
  return computed(() => {
    const rawAmount = toValue(amount)
    return calculateAllocation(rawAmount ?? 0, toValue(btcPercent), toValue(rates))
  })
}
