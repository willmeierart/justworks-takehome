<script setup lang="ts">
import { computed } from 'vue'

import { formatUpdatedAt } from '@/lib/format'

const props = defineProps<{
  isFetching: boolean
  isError: boolean
  dataUpdatedAt: number
}>()

const emit = defineEmits<{
  retry: []
}>()

const updatedLabel = computed(() => {
  if (!props.dataUpdatedAt) {
    return null
  }
  return formatUpdatedAt(props.dataUpdatedAt)
})
</script>

<template>
  <div class="pt-2">
    <div
      v-if="isError"
      class="bg-danger-bg text-danger rounded-card flex flex-col gap-3 p-4"
      role="alert"
    >
      <p>Prices could not be loaded. Your split is unchanged.</p>
      <button
        type="button"
        class="bg-accent text-accent-ink focus-visible:outline-forest rounded-pill px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="emit('retry')"
      >
        Try again
      </button>
    </div>

    <template v-else>
      <button
        type="button"
        class="bg-accent text-accent-ink focus-visible:outline-forest rounded-pill w-full py-3.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        :disabled="isFetching"
        :aria-disabled="isFetching"
        @click="emit('retry')"
      >
        {{ isFetching ? 'Updating prices' : 'Refresh prices' }}
      </button>
      <p class="text-ink-muted mt-3 text-center text-sm">
        <span v-if="updatedLabel">Coinbase, {{ updatedLabel }}</span>
        <span v-else>Coinbase live prices</span>
      </p>
    </template>
  </div>
</template>
