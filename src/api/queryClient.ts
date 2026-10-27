import { QueryClient } from '@tanstack/vue-query'

export const RATES_STALE_TIME_MS = 30_000

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: RATES_STALE_TIME_MS,
        retry: 1,
      },
    },
  })
}
