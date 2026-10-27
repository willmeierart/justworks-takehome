<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import CurrencyPicker from '@/components/CurrencyPicker.vue'
import { formatAmountInput, parseAmountInput } from '@/lib/format'
import type { FiatCurrency } from '@/lib/types'

const amount = defineModel<number | null>({ required: true })
const currency = defineModel<FiatCurrency>('currency', { required: true })

const inputId = 'holdings-amount'
const errorId = 'holdings-amount-error'
const display = ref(amount.value == null ? '' : formatAmountInput(String(amount.value)))
const rowEl = ref<HTMLElement | null>(null)
const symbolEl = ref<HTMLElement | null>(null)
const measureEl = ref<HTMLElement | null>(null)

let observer: ResizeObserver | null = null
let fitting = false

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

function fitAmount() {
  const row = rowEl.value
  const symbol = symbolEl.value
  const measure = measureEl.value
  if (!row || !symbol || !measure || fitting || row.clientWidth === 0) {
    return
  }

  fitting = true
  row.style.fontSize = ''
  let size = parseFloat(getComputedStyle(row).fontSize)
  const min = 18
  const gap = 8
  while (size > min && measure.offsetWidth + symbol.offsetWidth + gap > row.clientWidth) {
    size -= 1
    row.style.fontSize = `${size}px`
  }
  fitting = false
}

function scheduleFit() {
  void nextTick(fitAmount)
}

function onInput(event: Event) {
  const next = formatAmountInput((event.target as HTMLInputElement).value)
  display.value = next
  amount.value = parseAmountInput(next)
  scheduleFit()
}

watch(display, scheduleFit)
watch(currency, scheduleFit)

onMounted(() => {
  scheduleFit()
  if (rowEl.value) {
    observer = new ResizeObserver(() => fitAmount())
    observer.observe(rowEl.value)
  }
  void document.fonts?.ready.then(() => fitAmount())
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="figure-frame">
    <label :for="inputId" class="text-ink-muted text-sm font-medium">You have</label>
    <div
      ref="rowEl"
      class="figure-amount text-ink relative mt-3 flex items-baseline gap-2 font-semibold tracking-tight whitespace-nowrap tabular-nums"
    >
      <div ref="symbolEl" class="shrink-0">
        <CurrencyPicker v-model="currency" />
      </div>
      <input
        :id="inputId"
        :value="display"
        inputmode="decimal"
        autocomplete="off"
        placeholder="0"
        :aria-invalid="isInvalid"
        :aria-describedby="isInvalid ? errorId : undefined"
        class="placeholder:text-ink/20 min-w-0 flex-1 border-0 bg-transparent p-0 text-[length:inherit] font-semibold tracking-tight outline-none"
        @input="onInput"
      />
      <span
        ref="measureEl"
        class="pointer-events-none absolute top-0 left-0 -z-10 whitespace-nowrap opacity-0"
        aria-hidden="true"
        >{{ display || '0' }}</span
      >
    </div>
    <p v-if="isInvalid" :id="errorId" class="text-danger mt-2 text-sm">
      Enter a number that is zero or greater.
    </p>
  </div>
</template>
