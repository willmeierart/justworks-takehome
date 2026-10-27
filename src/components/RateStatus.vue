<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { formatLastRefreshed } from '@/lib/format'

const props = defineProps<{
  isFetching: boolean
  isError: boolean
  dataUpdatedAt: number
}>()

const emit = defineEmits<{
  retry: []
}>()

const now = ref(Date.now())
let timer = 0

const updatedLabel = computed(() => {
  if (!props.dataUpdatedAt) {
    return null
  }
  return formatLastRefreshed(props.dataUpdatedAt, now.value)
})

const updatedAtIso = computed(() =>
  props.dataUpdatedAt ? new Date(props.dataUpdatedAt).toISOString() : undefined,
)

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 30_000)
})

onUnmounted(() => {
  window.clearInterval(timer)
})
</script>

<template>
  <div class="pt-2">
    <div
      v-if="isError"
      class="bg-danger-bg text-danger rounded-card flex w-full flex-col gap-3 p-4"
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

    <div v-else class="flex flex-col items-center lg:items-start">
      <button
        type="button"
        class="bg-accent text-accent-ink focus-visible:outline-forest rounded-pill w-full py-3.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 lg:w-auto lg:px-10"
        :disabled="isFetching"
        :aria-disabled="isFetching"
        @click="emit('retry')"
      >
        {{ isFetching ? 'Updating prices' : 'Refresh prices' }}
      </button>
    </div>

    <p v-if="updatedLabel" class="text-ink-muted mt-3 text-center text-sm lg:text-left">
      Last refreshed: <time :datetime="updatedAtIso">{{ updatedLabel }}</time>
    </p>
  </div>
</template>
