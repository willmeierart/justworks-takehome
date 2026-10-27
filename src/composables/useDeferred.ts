import { onScopeDispose, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

import { debounce } from '@/lib/debounce'

/** How long the amount or split must sit still before the quote follows. */
export const QUOTE_SETTLE_MS = 320

/**
 * The latest source value, published only after it stops changing.
 * The first read is immediate so a restored form does not wait out the timer.
 */
export function useDeferred<T>(source: MaybeRefOrGetter<T>, waitMs: number): Ref<T> {
  const current = shallowRef(toValue(source)) as Ref<T>
  const commit = debounce(() => {
    current.value = toValue(source)
  }, waitMs)

  watch(
    () => toValue(source),
    (value) => {
      if (Object.is(value, current.value)) {
        commit.cancel()
        return
      }
      commit()
    },
  )

  onScopeDispose(() => commit.cancel())
  return current
}
