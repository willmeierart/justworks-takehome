export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function onReducedMotionChange(listener: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handle = () => listener(media.matches)
  media.addEventListener('change', handle)
  return () => media.removeEventListener('change', handle)
}
