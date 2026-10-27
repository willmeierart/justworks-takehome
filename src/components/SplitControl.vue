<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import { caretAfterKeptChars, sanitizePercentDraft } from '@/domain/format'

const btcPercent = defineModel<number>({ required: true })

const btcId = 'split-btc-percent'
const ethId = 'split-eth-percent'
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
  btcPercent.value = clamp(((clientX - rect.left - padLeft) / width) * 100)
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
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault()
    btcPercent.value = clamp(btcPercent.value - step)
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault()
    btcPercent.value = clamp(btcPercent.value + step)
  }
  if (event.key === 'Home') {
    event.preventDefault()
    btcPercent.value = 0
  }
  if (event.key === 'End') {
    event.preventDefault()
    btcPercent.value = 100
  }
}

function blockNonDigits(event: InputEvent) {
  if (event.inputType === 'insertText' && event.data != null && /\D/.test(event.data)) {
    event.preventDefault()
  }
}

function writeField(input: HTMLInputElement, next: string, raw: string) {
  const caret = caretAfterKeptChars(next, raw, input.selectionStart ?? raw.length)
  input.value = next
  input.setSelectionRange(caret, caret)
  void nextTick(() => {
    if (document.activeElement === input) {
      input.setSelectionRange(caret, caret)
    }
  })
}

function onBtcInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value
  const next = sanitizePercentDraft(raw)
  btcDisplay.value = next
  writeField(input, next, raw)
  btcPercent.value = next === '' ? 0 : Number(next)
}

function onEthInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value
  const next = sanitizePercentDraft(raw)
  ethDisplay.value = next
  writeField(input, next, raw)
  btcPercent.value = clamp(next === '' ? 100 : 100 - Number(next))
}

function onPercentKeydown(event: KeyboardEvent, side: 'btc' | 'eth') {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
    return
  }
  event.preventDefault()
  const step = event.shiftKey ? 10 : 1
  const direction = event.key === 'ArrowUp' ? 1 : -1
  if (side === 'btc') {
    btcPercent.value = clamp(Math.round(btcPercent.value) + direction * step)
    btcDisplay.value = String(Math.round(btcPercent.value))
    return
  }
  btcPercent.value = clamp(Math.round(btcPercent.value) - direction * step)
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
</script>

<template>
  <div class="figure-frame">
    <p class="text-ink-muted text-sm font-medium">Split</p>

    <div class="split-layout">
      <label :for="btcId" class="split-btc-label text-ink-muted text-sm">BTC</label>
      <label
        :for="btcId"
        class="split-btc-field input-shell inline-flex min-w-16 cursor-text items-baseline justify-center gap-0.5 px-3 py-2"
      >
        <input
          :id="btcId"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :value="btcDisplay"
          role="spinbutton"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(btcPercent)"
          :aria-valuetext="`${Math.round(btcPercent)} percent`"
          class="figure-split text-ink focus-visible:outline-forest w-auto min-w-[1ch] bg-transparent p-0 font-semibold tabular-nums outline-none [field-sizing:content] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
          @beforeinput="blockNonDigits"
          @keydown="onPercentKeydown($event, 'btc')"
          @focus="btcFocused = true"
          @input="onBtcInput"
          @blur="onBtcBlur"
        />
        <span class="figure-split text-ink font-semibold">%</span>
      </label>

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
          :style="{ left: `${btcPercent}%` }"
          @keydown="onHandleKeydown"
        >
          <span class="bg-card/80 h-2.5 w-px rounded-full" />
          <span class="bg-card/80 h-2.5 w-px rounded-full" />
        </div>
      </div>

      <label :for="ethId" class="split-eth-label text-ink-muted text-sm">ETH</label>
      <label
        :for="ethId"
        class="split-eth-field input-shell inline-flex min-w-16 cursor-text items-baseline justify-center gap-0.5 px-3 py-2"
      >
        <input
          :id="ethId"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :value="ethDisplay"
          role="spinbutton"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="ethPercent"
          :aria-valuetext="`${ethPercent} percent`"
          class="figure-split text-ink focus-visible:outline-forest w-auto min-w-[1ch] bg-transparent p-0 font-semibold tabular-nums outline-none [field-sizing:content] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
          @beforeinput="blockNonDigits"
          @keydown="onPercentKeydown($event, 'eth')"
          @focus="ethFocused = true"
          @input="onEthInput"
          @blur="onEthBlur"
        />
        <span class="figure-split text-ink font-semibold">%</span>
      </label>
    </div>
  </div>
</template>
