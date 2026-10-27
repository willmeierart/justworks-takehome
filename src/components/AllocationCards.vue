<script setup lang="ts">
import { computed } from 'vue'

import type { Allocation } from '@/lib/calculateAllocation'
import { formatCrypto, formatFiat, formatUnitPrice } from '@/lib/format'
import type { CryptoAsset, ExchangeRates, FiatCurrency } from '@/lib/types'

const props = defineProps<{
  allocation: Allocation
  currency: FiatCurrency
  rates: ExchangeRates | null
  hasAmount: boolean
  isFetching: boolean
}>()

const rows = computed(() => {
  const assets: { code: CryptoAsset; name: string; crypto: number | null }[] = [
    { code: 'BTC', name: 'Bitcoin', crypto: props.allocation.btcCrypto },
    { code: 'ETH', name: 'Ether', crypto: props.allocation.ethCrypto },
  ]

  return assets.map((asset) => {
    const fiat = asset.code === 'BTC' ? props.allocation.btcFiat : props.allocation.ethFiat
    const price = formatUnitPrice(props.rates?.[asset.code], props.currency)
    return {
      code: asset.code,
      name: asset.name,
      crypto:
        props.hasAmount && props.rates && asset.crypto != null
          ? formatCrypto(asset.crypto, asset.code)
          : `0.00 ${asset.code}`,
      fiat: formatFiat(props.hasAmount ? fiat : 0, props.currency),
      price: price == null ? 'Price loading' : `${price} / ${asset.code}`,
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
        <div
          class="flex flex-col gap-1 @min-[24rem]:flex-row @min-[24rem]:items-baseline @min-[24rem]:justify-between @min-[24rem]:gap-4"
        >
          <p class="text-ink-muted text-sm font-medium @min-[24rem]:order-2">{{ row.name }}</p>
          <p
            class="figure-crypto text-ink min-w-0 font-semibold tracking-tight whitespace-nowrap tabular-nums @min-[24rem]:order-1"
          >
            {{ row.crypto }}
          </p>
        </div>
        <div
          class="text-ink-muted mt-1 flex flex-col gap-0.5 text-sm tabular-nums @min-[24rem]:flex-row @min-[24rem]:items-baseline @min-[24rem]:justify-between @min-[24rem]:gap-4"
        >
          <p>{{ row.fiat }}</p>
          <p>{{ row.price }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
