import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import SplitControl from './SplitControl.vue'

describe('SplitControl', () => {
  it('keeps the two percents linked', async () => {
    const wrapper = mount(SplitControl, {
      props: {
        modelValue: 70,
        'onUpdate:modelValue': (value: number) => {
          void wrapper.setProps({ modelValue: value })
        },
      },
    })

    const [btc] = wrapper.findAll('input')
    await btc.setValue('40')
    await nextTick()
    const values = wrapper
      .findAll('input')
      .map((input) => (input.element as HTMLInputElement).value)
    expect(values[0]).toBe('40')
    expect(values[1]).toBe('60')
  })

  it('strips letters from a percent field', async () => {
    const wrapper = mount(SplitControl, {
      props: {
        modelValue: 70,
        'onUpdate:modelValue': (value: number) => {
          void wrapper.setProps({ modelValue: value })
        },
      },
    })

    const [btc] = wrapper.findAll('input')
    await btc.setValue('15a0')
    expect((btc.element as HTMLInputElement).value).toBe('100')
  })
})
