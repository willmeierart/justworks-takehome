<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useRollingValue } from '@/composables/useRollingValue'

const props = defineProps<{
  value: number
  format: (value: number) => string
  /** When this changes, the formatter updates with the new quote, not with the form. */
  asOf?: string
}>()

const rolling = useRollingValue(() => props.value)
const activeFormat = ref(props.format)

watch(
  () => [props.value, props.asOf] as const,
  () => {
    activeFormat.value = props.format
  },
)

const text = computed(() => activeFormat.value(rolling.value))
</script>

<template>{{ text }}</template>
