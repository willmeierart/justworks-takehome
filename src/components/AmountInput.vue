<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import CurrencyPicker from '@/components/CurrencyPicker.vue'
import { formatAmountInput, parseAmountInput } from '@/lib/format'
import type { FiatCurrency } from '@/lib/types'

const amount = defineModel<number | null>({ required: true })
const currency = defineModel<FiatCurrency>('currency', { required: true })

const inputId = 'holdings-amount'
const errorId = 'holdings-amount-error'
const display = ref(amount.value == null ? '' : formatAmountInput(String(amount.value)))

watch(amount, (value) => {
  const parsed = parseAmountInput(display.value)
  if (value !== parsed) {
    display.value = value == null ? '' : formatAmountInput(String(value))
  }
})

const isInvalid = computed(() => {
  if (display.value.trim() === '') {
    return false
  }
  return parseAmountInput(display.value) == null
})

function onInput(event: Event) {
  const next = formatAmountInput((event.target as HTMLInputElement).value)
  display.value = next
  amount.value = parseAmountInput(next)
}
</script>

<template>
  <div>
    <label :for="inputId" class="text-ink-muted text-sm font-medium">You have</label>
    <div
      class="text-ink mt-3 flex items-baseline gap-2 font-semibold tracking-tight"
      :class="display.length > 9 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'"
    >
      <CurrencyPicker v-model="currency" />
      <input
        :id="inputId"
        :value="display"
        inputmode="decimal"
        autocomplete="off"
        placeholder="0"
        :aria-invalid="isInvalid"
        :aria-describedby="isInvalid ? errorId : undefined"
        class="placeholder:text-ink/20 min-w-0 flex-1 border-0 bg-transparent p-0 text-[length:inherit] font-semibold tabular-nums tracking-tight outline-none"
        @input="onInput"
      />
    </div>
    <p v-if="isInvalid" :id="errorId" class="text-danger mt-2 text-sm">
      Enter a number that is zero or greater.
    </p>
  </div>
</template>
