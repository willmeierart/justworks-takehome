# Holdings split

A one-screen calculator: enter a USD, EUR, or GBP amount, split it between BTC and ETH, and see how much of each to buy from live Coinbase rates. Refreshing the page restores what you entered.

## Run

```bash
npm install
npm run dev
```

```bash
npm run test
npm run check
```

`check` is typecheck, ESLint (including `eslint-plugin-vuejs-accessibility`), Prettier, and unit tests.

Vue-specific notes for this codebase are in [docs/vue-principles.md](docs/vue-principles.md).

## Decisions

### Query plus a typed client

`@tanstack/vue-query` owns in-flight dedupe, retry, and stale time. Currency is in the query key, so switching USD → EUR is a different cache entry and refetches immediately. The `queryFn` calls `src/lib/coinbase.ts`, which uses `fetch`, forwards Query’s `AbortSignal`, and type-guards `BTC` / `ETH`. A malformed Coinbase body fails in that guard instead of becoming `undefined` multiplied into a holding.

Hand-rolling the cache would reimplement request coalescing and abort races that Query already handles. Putting raw `fetch` in `queryFn` would hide the HTTP contract behind library status flags.

### Debounced refetch when the amount changes

The Coinbase URL does not take an amount. The rate is crypto per 1 unit of fiat. Changing the amount still invalidates the current currency query after 400ms so the quote does not sit on a rate from a minute ago while someone types a large number. Extra traffic is bounded by that debounce and a 30s `staleTime`.

### localStorage, not the URL

Amount, currency, and split are written to `localStorage`. That restores the form on refresh without putting a holdings figure in history, referrers, or a shareable link. Corrupt JSON falls back to a 50/50 split in USD with an empty amount.

### Composables, not Pinia

`useHoldings` and `useExchangeRates` are the only state owners, both used by one screen. A store would add an actions/getters API with no second consumer.

### The layout changes with the window

Below 1024px the screen stays one column, in the order you use it: amount, split, quote. That column is the window, not a 28rem phone frame floated in the margin. The amount and the crypto quantities take their size from the card (`@container`), and the amount steps down again if the typed number would overflow, so a figure like `£ 3,333,333` stays one line.

From 1024px the quote sits beside the amount and the split. Each asset row is a quantity, a fiat total, and a unit price; that is the content that wants the extra width. The group stops growing at 72rem so an ultrawide window does not turn the drag track into a scrollbar.

### Unit tests of `src/lib`, not Playwright

The brief asked for a small suite of core logic. Allocation math, persist parsing, debounce, and the Coinbase type-guard live in TypeScript modules and are tested with Vitest. An e2e suite would cover the same paths with more setup and flake for a one-screen app.
