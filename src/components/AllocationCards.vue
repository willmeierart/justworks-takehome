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
    <h2 class="text-ink-muted text-sm font-medium">You'll get</h2>

    <div class="mt-5 flex flex-col gap-6">
      <div>
        <div class="flex items-baseline justify-between gap-3">
          <p class="text-ink text-2xl font-semibold tracking-tight tabular-nums">
            {{
              hasAmount && props.rates && allocation.btcCrypto != null
                ? formatCrypto(allocation.btcCrypto, 'BTC')
                : '0.00 BTC'
            }}
          </p>
          <p class="text-ink-muted text-sm font-medium">Bitcoin</p>
        </div>
        <p class="text-ink-muted mt-1 text-sm tabular-nums">
          {{ formatUnitPrice(props.rates?.BTC, currency) ?? 'Price loading' }}
          <span v-if="hasAmount"> · {{ formatFiat(allocation.btcFiat, currency) }}</span>
        </p>
      </div>

      <div>
        <div class="flex items-baseline justify-between gap-3">
          <p class="text-ink text-2xl font-semibold tracking-tight tabular-nums">
            {{
              hasAmount && props.rates && allocation.ethCrypto != null
                ? formatCrypto(allocation.ethCrypto, 'ETH')
                : '0.00 ETH'
            }}
          </p>
          <p class="text-ink-muted text-sm font-medium">Ether</p>
        </div>
        <p class="text-ink-muted mt-1 text-sm tabular-nums">
          {{ formatUnitPrice(props.rates?.ETH, currency) ?? 'Price loading' }}
          <span v-if="hasAmount"> · {{ formatFiat(allocation.ethFiat, currency) }}</span>
        </p>
      </div>
    </div>
  </section>
</template>
