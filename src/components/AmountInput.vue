<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const amount = defineModel<number | null>({ required: true })

const inputId = 'holdings-amount'
const errorId = 'holdings-amount-error'
const display = ref(amount.value == null ? '' : String(amount.value))

watch(amount, (value) => {
  const parsed = display.value.trim() === '' ? null : Number(display.value)
  if (value !== parsed) {
    display.value = value == null ? '' : String(value)
  }
})

const isInvalid = computed(() => {
  if (display.value.trim() === '') {
    return false
  }
  const parsed = Number(display.value)
  return !Number.isFinite(parsed) || parsed < 0
})

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  display.value = raw
  if (raw.trim() === '') {
    amount.value = null
    return
  }
  const parsed = Number(raw)
  if (Number.isFinite(parsed) && parsed >= 0) {
    amount.value = parsed
  }
}
</script>

<template>
  <div>
    <label :for="inputId" class="text-ink-muted text-sm font-medium"> You have </label>
    <input
      :id="inputId"
      :value="display"
      inputmode="decimal"
      autocomplete="off"
      placeholder="0"
      :aria-invalid="isInvalid"
      :aria-describedby="isInvalid ? errorId : undefined"
      class="text-ink placeholder:text-line border-line mt-2 w-full border-0 border-b bg-transparent p-0 pb-2 font-medium tabular-nums tracking-tight outline-none focus-visible:border-ink"
      :class="display.length > 8 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'"
      @input="onInput"
    />
    <p v-if="isInvalid" :id="errorId" class="text-danger mt-2 text-sm">
      Enter a number that is zero or greater.
    </p>
  </div>
</template>
