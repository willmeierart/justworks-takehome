# Tickets

## Ticket 1 — Scaffold and lint

- [x] Vite Vue 3 + TypeScript in this folder
- [x] Tailwind (v4 if clean, else v3)
- [x] Vitest + happy-dom (or jsdom)
- [x] Path alias `@/`
- [x] ESLint 9 flat: typescript-eslint, eslint-plugin-vue, eslint-plugin-vuejs-accessibility, eslint-config-prettier
- [x] Prettier; `vue-tsc --noEmit`
- [x] Scripts: `dev`, `build`, `preview`, `test`, `lint`, `lint:fix`, `typecheck`, `format`, `check`
- [x] Gitignore the assignment PDF
- [x] Add `TICKETS.md` and `docs/vue-principles.md`

**Commit:** `scaffold project with linting, packages, etc.`

## Ticket 2 — Domain logic and tests

- [x] `src/lib/calculateAllocation.ts` — `crypto = amount * (percent/100) * rate`
- [x] Tests: 70/30, 50/50, 100/0, zero amount, missing rate
- [x] `src/lib/persist.ts` — parse/validate; corrupt payload ? defaults
- [x] `src/lib/format.ts` — `Intl` fiat + crypto precision
- [x] `src/lib/debounce.ts` — tested helper for amount-triggered refetch
- [x] `src/lib/coinbase.ts` — typed `fetch`, `AbortSignal`, type-guard

**Commit:** `add allocation math, persistence, and tests`

## Ticket 3 — Query and holdings state

- [x] `@tanstack/vue-query` + `VueQueryPlugin`
- [x] `useExchangeRates`: queryKey includes currency; `queryFn` uses typed client + `signal`
- [x] Currency change ? immediate refetch; amount change ? debounced invalidate/refetch
- [x] Expose `data`, `isFetching`, `isError`, `refetch`, `dataUpdatedAt`
- [x] `useHoldings`: amount, currency, btcPercent + localStorage
- [x] Allocation is `computed` from holdings + rates

**Commit:** `fetch exchange rates with vue query`

## Ticket 4 — Wise-inspired UI

- [x] Tailwind tokens (canvas, ink, accent, radius, type)
- [x] Amount, currency, split, allocation cards, rate status components
- [x] `App.vue` as composition root
- [x] Empty, invalid, loading, error, 0/100 split states
- [x] Responsive from ~360px; reduced motion

**Commit:** `build wise-inspired holdings calculator`

## Ticket 5 — Accessibility and lint-clean templates

- [x] Named/labeled controls; currency `fieldset`
- [x] Results `aria-live` (polite)
- [x] Keyboard path for amount, currency, slider, percents, retry
- [x] Visible focus, contrast, no positive tabindex
- [x] `npm run lint` clean, including vuejs-accessibility

**Commit:** `tighten accessibility and lint`
