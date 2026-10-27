import { ref, watch } from 'vue'

import {
  HOLDINGS_STORAGE_KEY,
  parseHoldings,
  readStorage,
  serializeHoldings,
  writeStorage,
} from '@/domain/persist'
import type { FiatCurrency, Holdings } from '@/domain/types'

function readStoredHoldings(): Holdings {
  return parseHoldings(readStorage(HOLDINGS_STORAGE_KEY))
}

export function useHoldings() {
  const stored = readStoredHoldings()
  const amount = ref<number | null>(stored.amount)
  const currency = ref<FiatCurrency>(stored.currency)
  const btcPercent = ref(stored.btcPercent)

  function persist() {
    writeStorage(
      HOLDINGS_STORAGE_KEY,
      serializeHoldings({
        amount: amount.value,
        currency: currency.value,
        btcPercent: btcPercent.value,
      }),
    )
  }

  watch([amount, currency, btcPercent], persist, { immediate: true })

  return {
    amount,
    currency,
    btcPercent,
  }
}
