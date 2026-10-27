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
  <div>
    <div
      v-if="isError"
      class="bg-danger-bg text-danger rounded-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <p>Rates could not be loaded. Your split is unchanged; try again to refresh the quote.</p>
      <button
        type="button"
        class="bg-card text-ink focus-visible:outline-ink rounded-pill shrink-0 px-4 py-2 text-sm font-semibold ring-1 ring-danger/20 focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>

    <div v-else class="text-ink-muted flex flex-wrap items-center justify-between gap-3 text-sm">
      <p>
        <span v-if="isFetching">Updating rates from Coinbase…</span>
        <span v-else-if="updatedLabel">Coinbase rates as of {{ updatedLabel }}</span>
        <span v-else>Fetching Coinbase rates…</span>
      </p>
      <button
        type="button"
        class="text-ink focus-visible:outline-ink rounded-pill px-3 py-1.5 text-sm font-semibold ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2"
        :disabled="isFetching"
        :aria-disabled="isFetching"
        @click="emit('retry')"
      >
        Refresh
      </button>
    </div>
  </div>
</template>
