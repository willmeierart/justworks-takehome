<script setup lang="ts">
import { computed, ref } from 'vue'

const btcPercent = defineModel<number>({ required: true })

const btcId = 'split-btc-percent'
const ethId = 'split-eth-percent'
const track = ref<HTMLElement | null>(null)

const ethPercent = computed(() => 100 - Math.round(btcPercent.value))

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
  if (rect.width <= 0) {
    return
  }
  btcPercent.value = clamp(((clientX - rect.left) / rect.width) * 100)
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

function onBtcInput(event: Event) {
  btcPercent.value = clamp(Number((event.target as HTMLInputElement).value))
}

function onEthInput(event: Event) {
  btcPercent.value = clamp(100 - Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div>
    <p class="text-ink-muted text-sm font-medium">Split</p>

    <div class="mt-5 flex items-baseline justify-between gap-3">
      <label :for="btcId" class="text-ink-muted text-sm">Bitcoin</label>
      <label :for="ethId" class="text-ink-muted text-sm">Ether</label>
    </div>

    <div class="mt-1 flex items-center gap-3">
      <div class="flex items-baseline">
        <input
          :id="btcId"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          :value="Math.round(btcPercent)"
          class="text-ink focus-visible:outline-forest w-auto min-w-[1ch] bg-transparent p-0 text-2xl font-semibold tabular-nums outline-none [field-sizing:content] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
          @input="onBtcInput"
        />
        <span class="text-ink text-2xl font-semibold">%</span>
      </div>

      <div
        ref="track"
        class="relative h-8 min-w-0 flex-1 cursor-grab touch-none active:cursor-grabbing"
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
          :aria-valuetext="`${Math.round(btcPercent)} percent Bitcoin, ${ethPercent} percent Ether`"
          class="border-card bg-forest focus-visible:outline-forest absolute top-1/2 flex h-7 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full border-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          :style="{ left: `${btcPercent}%` }"
          @keydown="onHandleKeydown"
        >
          <span class="bg-card/80 h-2.5 w-px rounded-full" />
          <span class="bg-card/80 h-2.5 w-px rounded-full" />
        </div>
      </div>

      <div class="flex items-baseline">
        <input
          :id="ethId"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          :value="ethPercent"
          class="text-ink focus-visible:outline-forest w-auto min-w-[1ch] bg-transparent p-0 text-right text-2xl font-semibold tabular-nums outline-none [field-sizing:content] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
          @input="onEthInput"
        />
        <span class="text-ink text-2xl font-semibold">%</span>
      </div>
    </div>
  </div>
</template>
