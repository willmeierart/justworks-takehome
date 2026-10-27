import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { calculateAllocation } from '@/lib/calculateAllocation'
import type { ExchangeRates } from '@/lib/types'

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
