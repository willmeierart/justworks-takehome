<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

import RollingFigure from '@/components/RollingFigure.vue'
import type { Allocation } from '@/domain/allocation'
import { formatCrypto, formatFiat, formatUnitPrice } from '@/domain/format'
import type { ExchangeRates, FiatCurrency } from '@/domain/types'

const props = defineProps<{
  allocation: Allocation
  currency: FiatCurrency
  rates: ExchangeRates | null
  isFetching: boolean
}>()

/** Last good rates stay on screen so a currency switch can roll instead of remount. */
const market = shallowRef<ExchangeRates | null>(null)
const cryptoShown = shallowRef<{ BTC: number; ETH: number }>({ BTC: 0, ETH: 0 })

watch(
  () => props.rates,
  (rates) => {
    if (rates) market.value = rates
  },
  { immediate: true },
)

watch(
  () => [props.allocation.btcCrypto, props.allocation.ethCrypto] as const,
  ([btc, eth]) => {
    cryptoShown.value = {
      BTC: btc ?? cryptoShown.value.BTC,
      ETH: eth ?? cryptoShown.value.ETH,
    }
  },
  { immediate: true },
)

const quoteCurrency = computed(() => market.value?.currency ?? props.currency)

const rows = computed(() =>
  (['BTC', 'ETH'] as const).map((code) => {
    const fiat = code === 'BTC' ? props.allocation.btcFiat : props.allocation.ethFiat
    const rate = market.value?.[code]
    const price = formatUnitPrice(rate, quoteCurrency.value)
    return {
      code,
      asOf: quoteCurrency.value,
      fiat,
      crypto: cryptoShown.value[code],
      priceValue: rate == null || rate <= 0 ? null : 1 / rate,
      priceLabel: price == null ? 'Price loading' : `${price} / ${code}`,
      cryptoText: (value: number) => formatCrypto(value, code, quoteCurrency.value),
      fiatText: (value: number) => formatFiat(value, quoteCurrency.value),
      priceText: (value: number) => `${formatFiat(value, quoteCurrency.value)} / ${code}`,
    }
  }),
)

const announcement = computed(() =>
  rows.value
    .map((row) => {
      const crypto = formatCrypto(row.crypto, row.code, quoteCurrency.value)
      const fiat = formatFiat(row.fiat, quoteCurrency.value)
      return `${crypto}, ${fiat}, ${row.priceLabel}`
    })
    .join('. '),
)
</script>

<template>
  <section class="figure-frame lg:flex lg:h-full lg:flex-1 lg:flex-col" :aria-busy="isFetching">
    <h2 class="text-ink-muted text-sm font-medium">You'll get</h2>

    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

    <div aria-hidden="true" class="mt-5 flex flex-col gap-8 lg:flex-1 lg:justify-between">
      <div v-for="row in rows" :key="row.code">
        <p
          class="figure-crypto text-ink min-w-0 font-semibold tracking-tight whitespace-nowrap tabular-nums"
        >
          <RollingFigure :value="row.crypto" :format="row.cryptoText" :as-of="row.asOf" />
        </p>
        <p class="figure-fiat text-ink-muted mt-1.5 font-medium tabular-nums">
          <RollingFigure :value="row.fiat" :format="row.fiatText" :as-of="row.asOf" />
        </p>
        <p v-if="row.priceValue != null" class="figure-price text-ink-muted mt-1 tabular-nums">
          <RollingFigure :value="row.priceValue" :format="row.priceText" :as-of="row.asOf" />
        </p>
        <p v-else class="figure-price text-ink-muted mt-1 tabular-nums">Price loading</p>
      </div>
    </div>
  </section>
</template>
