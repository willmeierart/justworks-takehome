<script setup lang="ts">
import AllocationCards from '@/components/AllocationCards.vue'
import AmountInput from '@/components/AmountInput.vue'
import CurrencySelect from '@/components/CurrencySelect.vue'
import RateStatus from '@/components/RateStatus.vue'
import SplitControl from '@/components/SplitControl.vue'
import { useAllocation } from '@/composables/useAllocation'
import { useExchangeRates } from '@/composables/useExchangeRates'
import { useHoldings } from '@/composables/useHoldings'

const { amount, currency, btcPercent } = useHoldings()
const { rates, isFetching, isError, dataUpdatedAt, refetch } = useExchangeRates(currency, amount)
const allocation = useAllocation(amount, btcPercent, rates)
</script>

<template>
  <div class="min-h-svh px-4 py-8 sm:px-6 sm:py-12">
    <div class="mx-auto flex w-full max-w-xl flex-col gap-8">
      <header>
        <p
          class="bg-accent text-accent-ink inline-flex rounded-pill px-3 py-1 text-xs font-semibold tracking-wide uppercase"
        >
          Holdings
        </p>
        <h1 class="text-ink mt-1 text-3xl font-semibold tracking-tight">
          Split cash into BTC and ETH
        </h1>
        <p class="text-ink-muted mt-2 text-base">
          Keep a starting 70/30 split, or change it. The quote uses live Coinbase rates for the
          currency you pick.
        </p>
      </header>

      <main class="bg-card rounded-card flex flex-col gap-8 p-5 shadow-sm ring-1 ring-line sm:p-8">
        <AmountInput v-model="amount" />
        <CurrencySelect v-model="currency" />
        <SplitControl v-model="btcPercent" />
        <AllocationCards
          :allocation="allocation"
          :currency="currency"
          :has-amount="amount != null && amount > 0"
          :has-rates="rates != null"
          :is-fetching="isFetching"
        />
        <RateStatus
          :is-fetching="isFetching"
          :is-error="isError"
          :data-updated-at="dataUpdatedAt"
          @retry="refetch()"
        />
      </main>
    </div>
  </div>
</template>
