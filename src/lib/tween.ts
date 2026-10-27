export function easeOutCubic(progress: number): number {
  const t = Math.min(1, Math.max(0, progress))
  return 1 - (1 - t) ** 3
}

export function tween(from: number, to: number, progress: number): number {
  return from + (to - from) * easeOutCubic(progress)
}
