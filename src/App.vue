<script setup lang="ts">
import AllocationCards from '@/components/AllocationCards.vue'
import AmountInput from '@/components/AmountInput.vue'
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
  <div class="min-h-svh px-4 py-10 sm:px-6 sm:py-16">
    <div class="mx-auto flex w-full max-w-md flex-col gap-3">
      <header class="mb-5">
        <p class="text-ink-muted text-sm font-medium">Holdings</p>
        <h1 class="text-ink mt-1 text-[1.75rem] leading-tight font-semibold tracking-tight">
          Bitcoin and Ether
        </h1>
      </header>

      <section class="bg-card rounded-card relative z-10 px-5 py-6">
        <AmountInput v-model="amount" v-model:currency="currency" />
      </section>

      <section class="bg-card rounded-card px-5 py-6">
        <SplitControl v-model="btcPercent" />
      </section>

      <section class="bg-card rounded-card px-5 py-6">
        <AllocationCards
          :allocation="allocation"
          :currency="currency"
          :rates="rates"
          :has-amount="amount != null && amount > 0"
          :is-fetching="isFetching"
        />
      </section>

      <RateStatus
        :is-fetching="isFetching"
        :is-error="isError"
        :data-updated-at="dataUpdatedAt"
        @retry="refetch()"
      />
    </div>
  </div>
</template>
