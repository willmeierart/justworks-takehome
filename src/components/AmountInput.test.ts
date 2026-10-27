import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import AmountInput from './AmountInput.vue'

function mountAmount(amount: number | null = null, currency: 'USD' | 'EUR' | 'GBP' = 'USD') {
  const wrapper = mount(AmountInput, {
    props: {
      modelValue: amount,
      currency,
      'onUpdate:modelValue': (value: number | null) => {
        void wrapper.setProps({ modelValue: value })
      },
      'onUpdate:currency': (value: 'USD' | 'EUR' | 'GBP') => {
        void wrapper.setProps({ currency: value })
      },
    },
  })
  return wrapper
}

describe('AmountInput', () => {
  it('strips letters from the amount', async () => {
    const wrapper = mountAmount()
    const input = wrapper.get('input')
    await input.setValue('12ab3')
    expect((input.element as HTMLInputElement).value).toBe('123')
  })

  it('steps the amount with arrow keys', async () => {
    const wrapper = mountAmount(10)
    const input = wrapper.get('input')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('11')
  })
})
