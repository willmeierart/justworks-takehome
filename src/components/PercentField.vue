<script setup lang="ts">
const display = defineModel<string>({ required: true })

defineProps<{
  inputId: string
  now: number
  valuetext: string
  fieldClass?: string
}>()

const emit = defineEmits<{
  beforeinput: [InputEvent]
  keydown: [KeyboardEvent]
  focus: []
  input: [Event]
  blur: []
}>()
</script>

<template>
  <label
    :for="inputId"
    :class="[
      fieldClass,
      'input-shell inline-flex min-w-16 cursor-text items-baseline justify-center gap-0.5 px-3 py-2',
    ]"
  >
    <input
      :id="inputId"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :value="display"
      role="spinbutton"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="now"
      :aria-valuetext="valuetext"
      class="figure-split text-ink focus-visible:outline-forest w-auto min-w-[1ch] bg-transparent p-0 font-semibold tabular-nums outline-none [field-sizing:content] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
      @beforeinput="emit('beforeinput', $event)"
      @keydown="emit('keydown', $event)"
      @focus="emit('focus')"
      @input="emit('input', $event)"
      @blur="emit('blur')"
    />
    <span class="figure-split text-ink font-semibold">%</span>
  </label>
</template>
