<script setup lang="ts">
import { useId } from 'vue'

import { FIAT_CURRENCIES, type FiatCurrency } from '@/lib/types'

const currency = defineModel<FiatCurrency>({ required: true })
const groupId = useId()
</script>

<template>
  <fieldset class="m-0 border-0 p-0">
    <legend class="text-ink-muted mb-2 text-sm font-medium">Currency</legend>
    <div class="bg-canvas flex gap-1 rounded-pill p-1 ring-1 ring-line">
      <label
        v-for="code in FIAT_CURRENCIES"
        :key="code"
        :for="`${groupId}-${code}`"
        class="rounded-pill relative flex-1 cursor-pointer text-center text-sm font-semibold"
      >
        <input
          :id="`${groupId}-${code}`"
          v-model="currency"
          type="radio"
          name="currency"
          :value="code"
          class="peer sr-only"
        />
        <span
          class="rounded-pill text-ink-muted peer-checked:bg-card peer-checked:text-ink peer-focus-visible:outline-ink block px-3 py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
        >
          {{ code }}
        </span>
      </label>
    </div>
  </fieldset>
</template>
