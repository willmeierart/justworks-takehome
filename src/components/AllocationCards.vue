<script setup lang="ts">
import type { Allocation } from '@/lib/calculateAllocation'
import { formatCrypto, formatFiat } from '@/lib/format'
import type { FiatCurrency } from '@/lib/types'

defineProps<{
  allocation: Allocation
  currency: FiatCurrency
  hasAmount: boolean
  hasRates: boolean
}>()
</script>

<template>
  <section aria-live="polite" aria-atomic="true">
    <h2 class="text-ink-muted text-sm font-medium">You�ll get</h2>

    <p v-if="!hasAmount" class="text-ink-muted mt-3 text-base">
      Enter an amount to see how much Bitcoin and Ether to buy.
    </p>

    <div v-else class="mt-3 grid gap-3 sm:grid-cols-2">
      <article class="bg-card rounded-card ring-line p-5 ring-1">
        <p class="text-ink-muted text-sm font-medium">Bitcoin</p>
        <p class="text-ink mt-2 text-2xl font-semibold tracking-tight tabular-nums">
          {{
            hasRates && allocation.btcCrypto != null
              ? formatCrypto(allocation.btcCrypto, 'BTC')
              : '�'
          }}
        </p>
        <p class="text-ink-muted mt-1 text-sm tabular-nums">
          {{ formatFiat(allocation.btcFiat, currency) }}
        </p>
      </article>

      <article class="bg-card rounded-card ring-line p-5 ring-1">
        <p class="text-ink-muted text-sm font-medium">Ether</p>
        <p class="text-ink mt-2 text-2xl font-semibold tracking-tight tabular-nums">
          {{
            hasRates && allocation.ethCrypto != null
              ? formatCrypto(allocation.ethCrypto, 'ETH')
              : '�'
          }}
        </p>
        <p class="text-ink-muted mt-1 text-sm tabular-nums">
          {{ formatFiat(allocation.ethFiat, currency) }}
        </p>
      </article>
    </div>
  </section>
</template>
