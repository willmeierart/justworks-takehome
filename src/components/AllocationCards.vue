<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

import RollingFigure from '@/components/RollingFigure.vue'
import type { Allocation } from '@/domain/allocation'
import { formatCrypto, formatFiat } from '@/domain/format'
import type { ExchangeRates, FiatCurrency } from '@/domain/types'

const props = defineProps<{
  allocation: Allocation
  currency: FiatCurrency
  rates: ExchangeRates | null
  isFetching: boolean
}>()

/** Last good rates stay on screen so a currency switch can roll instead of remount. */
const market = shallowRef<ExchangeRates | null>(null)

watch(
  () => props.rates,
  (rates) => {
    if (rates) market.value = rates
  },
  { immediate: true },
)

const rows = computed(() => {
  const rates = market.value
  const currency = rates != null ? rates.currency : props.currency

  return (['BTC', 'ETH'] as const).map((code) => {
    const fiat = code === 'BTC' ? props.allocation.btcFiat : props.allocation.ethFiat
    const rate = rates?.[code]
    return {
      code,
      asOf: currency,
      fiat,
      crypto: rate == null ? 0 : fiat * rate,
      priceValue: rate == null || rate <= 0 ? null : 1 / rate,
      cryptoText: (value: number) => formatCrypto(value, code),
      fiatText: (value: number) => formatFiat(value, currency),
      priceText: (value: number) => `${formatFiat(value, currency)} / ${code}`,
    }
  })
})
</script>

<template>
  <section
    class="figure-frame lg:flex lg:h-full lg:flex-1 lg:flex-col"
    aria-live="polite"
    aria-atomic="true"
    :aria-busy="isFetching"
  >
    <h2 class="text-ink-muted text-sm font-medium">You'll get</h2>

    <div class="mt-5 flex flex-col gap-8 lg:flex-1 lg:justify-between">
      <div v-for="row in rows" :key="row.code">
        <p
          class="figure-crypto text-ink min-w-0 font-semibold tracking-tight whitespace-nowrap tabular-nums"
        >
          <RollingFigure :value="row.crypto" :format="row.cryptoText" :as-of="row.asOf" />
        </p>
        <p class="figure-fiat text-ink-muted mt-1.5 font-medium tabular-nums">
          <RollingFigure :value="row.fiat" :format="row.fiatText" :as-of="row.asOf" />
        </p>
        <p v-if="row.priceValue != null" class="figure-price mt-1 tabular-nums">
          <RollingFigure :value="row.priceValue" :format="row.priceText" :as-of="row.asOf" />
        </p>
        <p v-else class="figure-price mt-1 tabular-nums">Price loading</p>
      </div>
    </div>
  </section>
</template>
