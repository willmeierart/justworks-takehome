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
  <div class="min-h-svh px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
    <div
      class="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-4"
    >
      <header class="mb-3 sm:mb-5 lg:col-span-2">
        <p class="text-ink-muted text-sm font-medium">Holdings</p>
        <h1
          class="text-ink mt-1 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl lg:text-4xl"
        >
          Bitcoin and Ether
        </h1>
      </header>

      <section class="bg-card rounded-card relative z-10 min-w-0 px-4 py-5 sm:px-6 sm:py-6">
        <AmountInput v-model="amount" v-model:currency="currency" />
      </section>

      <section class="bg-card rounded-card min-w-0 px-4 py-5 sm:px-6 sm:py-6">
        <SplitControl v-model="btcPercent" />
      </section>

      <section
        class="bg-card rounded-card min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:flex lg:flex-col lg:self-stretch"
      >
        <AllocationCards
          :allocation="allocation"
          :currency="currency"
          :rates="rates"
          :has-amount="amount != null && amount > 0"
          :is-fetching="isFetching"
        />
      </section>

      <div class="min-w-0 lg:col-span-2">
        <RateStatus
          :is-fetching="isFetching"
          :is-error="isError"
          :data-updated-at="dataUpdatedAt"
          @retry="refetch()"
        />
      </div>
    </div>
  </div>
</template>
