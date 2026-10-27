<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { FIAT_CURRENCIES, FIAT_UNITS, type FiatCurrency } from '@/lib/types'

const currency = defineModel<FiatCurrency>({ required: true })

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const listId = 'currency-options'
const buttonId = 'currency-toggle'

const symbol = computed(() => FIAT_UNITS[currency.value].symbol)

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function choose(code: FiatCurrency) {
  currency.value = code
  close()
}

function onDocumentPointer(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) {
    close()
  }
}

function onToggleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    open.value = true
  }
  if (event.key === 'Escape') {
    close()
  }
}

function onOptionKeydown(event: KeyboardEvent, code: FiatCurrency) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    choose(code)
  }
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
})
</script>

<template>
  <div ref="root" class="relative shrink-0">
    <button
      :id="buttonId"
      type="button"
      class="text-ink focus-visible:outline-forest inline-flex items-baseline gap-1 rounded-md text-[length:inherit] font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-controls="listId"
      :aria-label="`Currency, ${currency}`"
      @click="toggle"
      @keydown="onToggleKeydown"
    >
      <span>{{ symbol }}</span>
      <svg
        class="text-ink mb-[0.12em] h-[0.32em] w-[0.32em] opacity-70"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path
          d="M2.4 4.2 6 8l3.6-3.8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <ul
      v-if="open"
      :id="listId"
      role="listbox"
      :aria-labelledby="buttonId"
      class="border-line bg-card absolute top-full left-0 z-30 mt-2 min-w-40 overflow-hidden rounded-2xl border py-1 shadow-lg"
    >
      <li v-for="code in FIAT_CURRENCIES" :key="code" class="list-none">
        <button
          type="button"
          role="option"
          :aria-selected="code === currency"
          class="text-ink hover:bg-canvas flex w-full items-center justify-between gap-6 px-3 py-2 text-left text-sm font-medium"
          :class="code === currency ? 'bg-canvas' : ''"
          @click="choose(code)"
          @keydown="onOptionKeydown($event, code)"
        >
          <span class="tabular-nums">{{ FIAT_UNITS[code].symbol }}</span>
          <span class="text-ink-muted">{{ FIAT_UNITS[code].code }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
