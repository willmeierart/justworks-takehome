<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import CurrencyPicker from '@/components/CurrencyPicker.vue'
import { caretAfterKeptChars, formatAmountInput, parseAmountInput } from '@/domain/format'
import type { FiatCurrency } from '@/domain/types'

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

function placeCaret(input: HTMLInputElement, caret: number) {
  const pos = Math.min(Math.max(0, caret), input.value.length)
  input.setSelectionRange(pos, pos)
}

function onBeforeInput(event: InputEvent) {
  if (event.inputType !== 'insertText' || !event.data) {
    return
  }
  const input = event.target as HTMLInputElement
  if (!/^[\d.]$/.test(event.data) || (event.data === '.' && input.value.includes('.'))) {
    event.preventDefault()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
    return
  }
  event.preventDefault()
  const step = event.shiftKey ? 10 : 1
  const direction = event.key === 'ArrowUp' ? 1 : -1
  const current = amount.value ?? 0
  const next = Math.max(0, Math.round((current + direction * step) * 100) / 100)
  amount.value = next
  display.value = formatAmountInput(String(next))
  scheduleFit()
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value
  const next = formatAmountInput(raw)
  const caret = caretAfterKeptChars(next, raw, input.selectionStart ?? raw.length)
  display.value = next
  amount.value = parseAmountInput(next)
  input.value = next
  placeCaret(input, caret)
  void nextTick(() => {
    if (document.activeElement === input) {
      placeCaret(input, caret)
    }
  })
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
          :aria-invalid="isInvalid"
          :aria-describedby="isInvalid ? errorId : undefined"
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
    <p v-if="isInvalid" :id="errorId" class="text-danger mt-2 text-sm">
      Enter a number that is zero or greater.
    </p>
  </div>
</template>
