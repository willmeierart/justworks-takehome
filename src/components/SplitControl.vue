<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

import PercentField from '@/components/PercentField.vue'
import { caretAfterKeptChars, sanitizePercentDraft } from '@/domain/format'
import { rejectNonNumericInsert, spinFromKey, writeFormattedValue } from '@/lib/numericInput'

const btcPercent = defineModel<number>({ required: true })

const btcId = useId()
const ethId = useId()
const track = ref<HTMLElement | null>(null)
const btcFocused = ref(false)
const ethFocused = ref(false)
const btcDisplay = ref(String(Math.round(btcPercent.value)))
const ethDisplay = ref(String(100 - Math.round(btcPercent.value)))

const ethPercent = computed(() => 100 - Math.round(btcPercent.value))

watch(btcPercent, () => {
  if (!btcFocused.value) {
    btcDisplay.value = String(Math.round(btcPercent.value))
  }
  if (!ethFocused.value) {
    ethDisplay.value = String(ethPercent.value)
  }
})

function clamp(value: number): number {
  if (!Number.isFinite(value)) {
    return Math.round(btcPercent.value)
  }
  return Math.min(100, Math.max(0, Math.round(value)))
}

function setFromClientX(clientX: number) {
  const el = track.value
  if (!el) {
    return
  }
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  const padLeft = parseFloat(style.paddingLeft) || 0
  const padRight = parseFloat(style.paddingRight) || 0
  const width = rect.width - padLeft - padRight
  if (width <= 0) {
    return
  }
  btcPercent.value = clamp(100 - ((clientX - rect.left - padLeft) / width) * 100)
}

function onPointerDown(event: PointerEvent) {
  event.preventDefault()
  setFromClientX(event.clientX)
  const target = event.currentTarget as HTMLElement
  if (typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(event.pointerId)
    } catch {
      // untrusted or already-released pointers can throw; the position is already set
    }
  }
}

function onPointerMove(event: PointerEvent) {
  if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
    setFromClientX(event.clientX)
  }
}

function onHandleKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 10 : 1
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    btcPercent.value = clamp(btcPercent.value + step)
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    btcPercent.value = clamp(btcPercent.value - step)
  }
  if (event.key === 'Home') {
    event.preventDefault()
    btcPercent.value = 100
  }
  if (event.key === 'End') {
    event.preventDefault()
    btcPercent.value = 0
  }
}

function applyDraft(input: HTMLInputElement, raw: string, asBtc: boolean) {
  const next = sanitizePercentDraft(raw)
  writeFormattedValue(input, next, raw, caretAfterKeptChars)
  if (asBtc) {
    btcDisplay.value = next
    btcPercent.value = next === '' ? 0 : Number(next)
    return
  }
  ethDisplay.value = next
  btcPercent.value = clamp(next === '' ? 100 : 100 - Number(next))
}

function onPercentKeydown(event: KeyboardEvent, side: 'btc' | 'eth') {
  if (side === 'btc') {
    const next = spinFromKey(event, Math.round(btcPercent.value), {
      min: 0,
      max: 100,
      step: 1,
      shiftStep: 10,
    })
    if (next == null) return
    btcPercent.value = next
    btcDisplay.value = String(next)
    return
  }
  const next = spinFromKey(event, ethPercent.value, {
    min: 0,
    max: 100,
    step: 1,
    shiftStep: 10,
  })
  if (next == null) return
  btcPercent.value = clamp(100 - next)
  ethDisplay.value = String(ethPercent.value)
}

function onBtcBlur() {
  btcFocused.value = false
  btcDisplay.value = String(Math.round(btcPercent.value))
}

function onEthBlur() {
  ethFocused.value = false
  ethDisplay.value = String(ethPercent.value)
}

function restoreCaret(input: HTMLInputElement) {
  void nextTick(() => {
    if (document.activeElement === input) {
      const caret = input.selectionStart ?? input.value.length
      input.setSelectionRange(caret, caret)
    }
  })
}

function onBtcFieldInput(event: Event) {
  const input = event.target as HTMLInputElement
  applyDraft(input, input.value, true)
  restoreCaret(input)
}

function onEthFieldInput(event: Event) {
  const input = event.target as HTMLInputElement
  applyDraft(input, input.value, false)
  restoreCaret(input)
}
</script>

<template>
  <div class="figure-frame">
    <p class="text-ink-muted text-sm font-medium">Split</p>

    <div class="split-layout">
      <label :for="btcId" class="split-btc-label text-ink-muted text-sm">BTC</label>
      <PercentField
        v-model="btcDisplay"
        :input-id="btcId"
        field-class="split-btc-field"
        :now="Math.round(btcPercent)"
        :valuetext="`${Math.round(btcPercent)} percent`"
        @beforeinput="rejectNonNumericInsert($event, null)"
        @keydown="onPercentKeydown($event, 'btc')"
        @focus="btcFocused = true"
        @input="onBtcFieldInput"
        @blur="onBtcBlur"
      />

      <div
        ref="track"
        class="split-mixer"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
      >
        <div class="bg-line absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" />
        <div
          role="slider"
          tabindex="0"
          aria-label="Bitcoin percent"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(btcPercent)"
          :aria-valuetext="`${Math.round(btcPercent)} percent BTC, ${ethPercent} percent ETH`"
          class="border-card bg-forest focus-visible:outline-forest absolute top-1/2 flex h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full border-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          :style="{ left: `${ethPercent}%` }"
          @keydown="onHandleKeydown"
        >
          <span class="bg-card/80 h-2.5 w-px rounded-full" />
          <span class="bg-card/80 h-2.5 w-px rounded-full" />
        </div>
      </div>

      <label :for="ethId" class="split-eth-label text-ink-muted text-sm">ETH</label>
      <PercentField
        v-model="ethDisplay"
        :input-id="ethId"
        field-class="split-eth-field"
        :now="ethPercent"
        :valuetext="`${ethPercent} percent`"
        @beforeinput="rejectNonNumericInsert($event, null)"
        @keydown="onPercentKeydown($event, 'eth')"
        @focus="ethFocused = true"
        @input="onEthFieldInput"
        @blur="onEthBlur"
      />
    </div>
  </div>
</template>

<style>
.split-layout {
  display: grid;
  grid-template-columns: auto;
  justify-items: start;
  row-gap: 0.25rem;
  margin-top: 1.25rem;
}

.split-eth-label {
  margin-top: 1rem;
}

.split-mixer {
  display: none;
}

@container (min-width: 24rem) {
  .split-layout {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    column-gap: 0.75rem;
    align-items: center;
    justify-items: stretch;
  }

  .split-btc-label {
    grid-area: 1 / 1;
  }

  .split-eth-label {
    grid-area: 1 / 3;
    justify-self: end;
    margin-top: 0;
  }

  .split-btc-field {
    grid-area: 2 / 1;
  }

  .split-mixer {
    grid-area: 2 / 2;
    justify-self: stretch;
    position: relative;
    display: block;
    height: 2rem;
    min-width: 0;
    align-self: center;
    padding-inline: 0.7rem;
    cursor: grab;
    touch-action: none;
  }

  .split-eth-field {
    grid-area: 2 / 3;
    justify-self: end;
  }

  .split-mixer:active {
    cursor: grabbing;
  }
}
</style>
