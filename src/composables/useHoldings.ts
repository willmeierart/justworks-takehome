import { computed, onMounted, ref, watch } from 'vue'

import { HOLDINGS_STORAGE_KEY, parseHoldings, serializeHoldings } from '@/lib/persist'
import type { FiatCurrency, Holdings } from '@/lib/types'

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

  function setBtcPercent(value: number) {
    if (!Number.isFinite(value)) {
      return
    }
    btcPercent.value = Math.min(100, Math.max(0, value))
  }

  watch([amount, currency, btcPercent], persist)
  onMounted(persist)

  return {
    amount,
    currency,
    btcPercent,
    ethPercent,
    setBtcPercent,
  }
}
