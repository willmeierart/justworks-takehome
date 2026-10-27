import { onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

import { onReducedMotionChange, prefersReducedMotion } from '@/lib/prefersReducedMotion'
import { tween } from '@/lib/tween'

export const QUOTE_ROLL_MS = 520

/** Follows `source`, easing the displayed number from the last value to the next. */
export function useRollingValue(
  source: MaybeRefOrGetter<number>,
  durationMs = QUOTE_ROLL_MS,
): Ref<number> {
  const current = ref(toValue(source))
  let frame = 0
  let reduced = prefersReducedMotion()

  const stopMotion = onReducedMotionChange((value) => {
    reduced = value
    if (value) {
      cancelAnimationFrame(frame)
      current.value = toValue(source)
    }
  })

  watch(
    () => toValue(source),
    (next) => {
      cancelAnimationFrame(frame)
      if (reduced || next === current.value) {
        current.value = next
        return
      }

      const from = current.value
      const started = performance.now()

      const tick = (now: number) => {
        const progress = (now - started) / durationMs
        if (progress >= 1) {
          current.value = next
          return
        }
        current.value = tween(from, next, progress)
        frame = requestAnimationFrame(tick)
      }

      frame = requestAnimationFrame(tick)
    },
  )

  onScopeDispose(() => {
    cancelAnimationFrame(frame)
    stopMotion()
  })
  return current
}
