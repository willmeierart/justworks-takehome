<script setup lang="ts">
const btcPercent = defineModel<number>({ required: true })

const sliderId = 'split-btc-slider'
const btcId = 'split-btc-percent'
const ethId = 'split-eth-percent'

function clamp(value: number): number {
  if (!Number.isFinite(value)) {
    return btcPercent.value
  }
  return Math.min(100, Math.max(0, Math.round(value)))
}

function onSlider(event: Event) {
  btcPercent.value = clamp(Number((event.target as HTMLInputElement).value))
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
    <p class="text-ink-muted text-sm font-semibold">Split</p>
    <p class="text-ink mt-1 text-lg font-semibold">
      <span class="text-btc">{{ Math.round(btcPercent) }}% Bitcoin</span>
      <span class="text-ink-muted"> / </span>
      <span class="text-eth">{{ Math.round(100 - btcPercent) }}% Ether</span>
    </p>

    <div class="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
      <div class="bg-btc" :style="{ width: `${btcPercent}%` }" />
      <div class="bg-eth flex-1" />
    </div>

    <label :for="sliderId" class="sr-only">Bitcoin percent</label>
    <input
      :id="sliderId"
      type="range"
      min="0"
      max="100"
      step="1"
      :value="btcPercent"
      class="mt-3 w-full"
      @input="onSlider"
    />

    <div class="mt-4 grid grid-cols-2 gap-3">
      <div>
        <label :for="btcId" class="text-btc text-sm font-semibold">Bitcoin</label>
        <div class="relative mt-1">
          <input
            :id="btcId"
            type="number"
            min="0"
            max="100"
            inputmode="numeric"
            :value="Math.round(btcPercent)"
            class="border-btc/30 bg-btc-bg text-ink focus-visible:outline-btc w-full rounded-2xl border px-3 py-2 pr-8 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2"
            @input="onBtcInput"
          />
          <span
            class="text-ink-muted pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm"
            >%</span
          >
        </div>
      </div>
      <div>
        <label :for="ethId" class="text-eth text-sm font-semibold">Ether</label>
        <div class="relative mt-1">
          <input
            :id="ethId"
            type="number"
            min="0"
            max="100"
            inputmode="numeric"
            :value="Math.round(100 - btcPercent)"
            class="border-eth/30 bg-eth-bg text-ink focus-visible:outline-eth w-full rounded-2xl border px-3 py-2 pr-8 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2"
            @input="onEthInput"
          />
          <span
            class="text-ink-muted pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm"
            >%</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
