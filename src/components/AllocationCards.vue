<script setup lang="ts">
import type { Allocation } from '@/lib/calculateAllocation'
import { formatCrypto, formatFiat, formatUnitPrice } from '@/lib/format'
import type { ExchangeRates, FiatCurrency } from '@/lib/types'

const props = defineProps<{
  allocation: Allocation
  currency: FiatCurrency
  rates: ExchangeRates | null
  hasAmount: boolean
  isFetching: boolean
}>()
</script>

<template>
  <section aria-live="polite" aria-atomic="true" :aria-busy="isFetching">
    <h2 class="text-ink-muted text-sm font-semibold">You'll get</h2>

    <p v-if="!hasAmount" class="text-ink-muted mt-3 text-base">
      Enter an amount to see how much Bitcoin and Ether to buy.
    </p>

    <div class="mt-3 grid gap-3 sm:grid-cols-2">
      <article class="bg-canvas/60 rounded-card ring-line p-5 ring-1">
        <div class="flex items-center justify-between gap-3">
          <p class="text-ink text-sm font-semibold">Bitcoin</p>
          <p class="text-ink-muted text-xs font-medium tabular-nums">
            {{ formatUnitPrice(props.rates?.BTC, currency) ?? 'Price loading' }}
            / BTC
          </p>
        </div>
        <p class="text-ink mt-3 text-2xl font-semibold tracking-tight tabular-nums">
          {{
            hasAmount && props.rates && allocation.btcCrypto != null
              ? formatCrypto(allocation.btcCrypto, 'BTC')
              : '--'
          }}
        </p>
        <p class="text-ink-muted mt-1 text-sm tabular-nums">
          {{ hasAmount ? formatFiat(allocation.btcFiat, currency) : formatFiat(0, currency) }}
        </p>
      </article>

      <article class="bg-canvas/60 rounded-card ring-line p-5 ring-1">
        <div class="flex items-center justify-between gap-3">
          <p class="text-ink text-sm font-semibold">Ether</p>
          <p class="text-ink-muted text-xs font-medium tabular-nums">
            {{ formatUnitPrice(props.rates?.ETH, currency) ?? 'Price loading' }}
            / ETH
          </p>
        </div>
        <p class="text-ink mt-3 text-2xl font-semibold tracking-tight tabular-nums">
          {{
            hasAmount && props.rates && allocation.ethCrypto != null
              ? formatCrypto(allocation.ethCrypto, 'ETH')
              : '--'
          }}
        </p>
        <p class="text-ink-muted mt-1 text-sm tabular-nums">
          {{ hasAmount ? formatFiat(allocation.ethFiat, currency) : formatFiat(0, currency) }}
        </p>
      </article>
    </div>
  </section>
</template>
