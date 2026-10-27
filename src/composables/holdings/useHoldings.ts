import { computed, onMounted, ref, watch } from 'vue'

import { HOLDINGS_STORAGE_KEY, parseHoldings, serializeHoldings } from '@/domain/persist'
import type { FiatCurrency, Holdings } from '@/domain/types'

function readStoredHoldings(): Holdings {
  if (typeof localStorage === 'undefined') {
    return parseHoldings(null)
  }
  return parseHoldings(localStorage.getItem(HOLDINGS_STORAGE_KEY))
}

export function useHoldings() {
  const stored = readStoredHoldings()
  const amount = ref<number | null>(stored.amount)
  const currency = ref<FiatCurrency>(stored.currency)
  const btcPercent = ref(stored.btcPercent)
  const ethPercent = computed(() => 100 - btcPercent.value)

  function persist() {
    if (typeof localStorage === 'undefined') {
      return
    }
    localStorage.setItem(
      HOLDINGS_STORAGE_KEY,
      serializeHoldings({
        amount: amount.value,
        currency: currency.value,
        btcPercent: btcPercent.value,
      }),
    )
  }

  watch([amount, currency, btcPercent], persist)
  onMounted(persist)

  return {
    amount,
    currency,
    btcPercent,
    ethPercent,
  }
}
