<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { currencySymbol, formatAmountInput, parseAmountInput } from '@/lib/format'
import type { FiatCurrency } from '@/lib/types'

const amount = defineModel<number | null>({ required: true })
const props = defineProps<{
  currency: FiatCurrency
}>()

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
  <div class="bg-mint rounded-card px-5 py-6 sm:px-6">
    <label :for="inputId" class="text-forest text-sm font-semibold">You have</label>
    <div class="mt-2 flex items-end gap-2">
      <span class="text-forest mb-1 text-3xl font-semibold sm:text-4xl" aria-hidden="true">
        {{ currencySymbol(props.currency) }}
      </span>
      <input
        :id="inputId"
        :value="display"
        inputmode="decimal"
        autocomplete="off"
        placeholder="0"
        :aria-invalid="isInvalid"
        :aria-describedby="isInvalid ? errorId : undefined"
        class="text-forest placeholder:text-forest/30 w-full border-0 bg-transparent p-0 font-semibold tabular-nums tracking-tight outline-none"
        :class="display.length > 9 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'"
        @input="onInput"
      />
    </div>
    <p v-if="isInvalid" :id="errorId" class="text-danger mt-2 text-sm">
      Enter a number that is zero or greater.
    </p>
  </div>
</template>
