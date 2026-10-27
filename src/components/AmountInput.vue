<script setup lang="ts">
import { nextTick, onMounted, onScopeDispose, ref, useId, watch } from 'vue'

import CurrencyPicker from '@/components/CurrencyPicker.vue'
import {
  caretAfterKeptChars,
  formatAmountFromNumber,
  formatAmountInput,
  parseAmountInput,
  separatorsFor,
} from '@/domain/format'
import type { FiatCurrency } from '@/domain/types'
import { rejectNonNumericInsert, spinFromKey, writeFormattedValue } from '@/lib/numericInput'

const amount = defineModel<number | null>({ required: true })
const currency = defineModel<FiatCurrency>('currency', { required: true })

const inputId = useId()
const display = ref(
  amount.value == null ? '' : formatAmountFromNumber(amount.value, currency.value),
)
const rowEl = ref<HTMLElement | null>(null)
const symbolEl = ref<HTMLElement | null>(null)
const measureEl = ref<HTMLElement | null>(null)

let observer: ResizeObserver | null = null

watch(amount, (value) => {
  const parsed = parseAmountInput(display.value, currency.value)
  if (value !== parsed) {
    display.value = value == null ? '' : formatAmountFromNumber(value, currency.value)
  }
})

watch(currency, () => {
  display.value = amount.value == null ? '' : formatAmountFromNumber(amount.value, currency.value)
})

function fitAmount() {
  const row = rowEl.value
  const symbol = symbolEl.value
  const measure = measureEl.value
  if (!row || !symbol || !measure || row.clientWidth === 0) {
    return
  }

  row.style.fontSize = ''
  const base = parseFloat(getComputedStyle(row).fontSize)
  const min = 18
  const gap = 8
  const needed = measure.offsetWidth + symbol.offsetWidth + gap
  if (needed <= row.clientWidth) {
    return
  }
  const next = Math.max(min, Math.floor(base * (row.clientWidth / needed)))
  row.style.fontSize = `${next}px`
}

function scheduleFit() {
  void nextTick(fitAmount)
}

function decimal(): string {
  return separatorsFor(currency.value).decimal
}

function onBeforeInput(event: InputEvent) {
  rejectNonNumericInsert(event, decimal())
}

function onKeydown(event: KeyboardEvent) {
  const next = spinFromKey(event, amount.value ?? 0, {
    min: 0,
    max: Number.MAX_SAFE_INTEGER,
    step: 1,
    shiftStep: 10,
    decimals: 2,
  })
  if (next == null) {
    return
  }
  amount.value = next
  display.value = formatAmountFromNumber(next, currency.value)
  scheduleFit()
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value
  const next = formatAmountInput(raw, currency.value)
  display.value = next
  amount.value = parseAmountInput(next, currency.value)
  writeFormattedValue(input, next, raw, (formatted, source, caret) =>
    caretAfterKeptChars(formatted, source, caret, decimal()),
  )
  void nextTick(() => {
    if (document.activeElement === input) {
      writeFormattedValue(input, next, raw, (formatted, source, caret) =>
        caretAfterKeptChars(formatted, source, caret, decimal()),
      )
    }
  })
  scheduleFit()
}

watch(display, scheduleFit)

onMounted(() => {
  scheduleFit()
  if (rowEl.value) {
    observer = new ResizeObserver(() => fitAmount())
    observer.observe(rowEl.value)
  }
  void document.fonts?.ready.then(() => fitAmount())
})

onScopeDispose(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="figure-frame">
    <label :for="inputId" class="text-ink-muted text-sm font-medium">You have</label>
    <div class="input-shell mt-3 px-3 py-2">
      <div
        ref="rowEl"
        class="figure-amount text-ink relative flex items-baseline gap-2 font-semibold tracking-tight whitespace-nowrap tabular-nums"
      >
        <div ref="symbolEl" class="shrink-0">
          <CurrencyPicker v-model="currency" />
        </div>
        <input
          :id="inputId"
          :value="display"
          inputmode="decimal"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="0"
          role="spinbutton"
          aria-valuemin="0"
          :aria-valuenow="amount ?? 0"
          :aria-valuetext="display || 'empty'"
          class="text-ink placeholder:text-ink/25 min-w-0 flex-1 border-0 bg-transparent p-0 text-[length:inherit] font-semibold tracking-tight outline-none"
          @beforeinput="onBeforeInput"
          @keydown="onKeydown"
          @input="onInput"
        />
        <span
          ref="measureEl"
          class="pointer-events-none absolute top-0 left-0 -z-10 whitespace-nowrap opacity-0"
          aria-hidden="true"
          >{{ display || '0' }}</span
        >
      </div>
    </div>
  </div>
</template>
