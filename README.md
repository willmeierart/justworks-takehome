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

`@tanstack/vue-query` owns in-flight dedupe, retry, and stale time. Currency is in the query key, so switching USD -> EUR is a different cache entry and refetches immediately. If that fetch fails, the picker returns to the last currency that had rates. The `queryFn` calls `src/api/coinbase.ts`, which uses `fetch`, forwards Query's `AbortSignal`, and type-guards `BTC` / `ETH`. A malformed Coinbase body fails in that guard instead of becoming `undefined` multiplied into a holding.

Hand-rolling the cache would reimplement request coalescing and abort races that Query already handles. Putting raw `fetch` in `queryFn` would hide the HTTP contract behind library status flags.

### Debounced refetch when the amount changes

The Coinbase URL does not take an amount. The rate is crypto per 1 unit of fiat. Changing the amount still invalidates the current currency query after 400ms, so a quote for a large number is priced from a fresh rate, not one from a minute ago. The debounce keeps that to one request per pause in typing.

### localStorage, not the URL

Amount, currency, and split are written to `localStorage`. That restores the form on refresh without putting a holdings figure in history, referrers, or a shareable link. A corrupt or partial payload falls back field by field to defaults.

### Composite controls

The currency is part of the amount: the symbol sits in the same field, at the same size, and opens a list of currencies. "I have 25,000" and "in dollars" are one statement, so they are one control, and the amount gets the full width of the row instead of sharing it with a separate select.

The split is one control with two ways in. On a wide card it is a drag track between the BTC and ETH percent fields, so you can scrub roughly or type exactly in the same place. The two fields are linked; changing one moves the other and the track.

### Editable fields are outlined

Everything you can change sits in a hairline outline that darkens on focus; everything computed has none. On a screen that is mostly large numbers, the outline is what tells you which numbers are yours.

### Type carries the hierarchy

The quote reads in three steps: the crypto quantity you would buy, then the fiat it costs, then the unit price that produced it, each smaller and quieter than the last. The amount you entered is the largest figure on the screen. There is one ink color; size and weight do the work.

### Style: the quote is quiet until you pause

The amount and the split update as you type or drag. "You'll get" holds the last settled figures until the inputs have been still for 320ms, then eases to the new ones. A quote that tracked every slider tick would flicker through amounts nobody is going to read. A rate refresh updates it immediately, because that change is not you mid-keystroke.

### Freshness, rounded the way a person would say it

The footer says when prices were last refreshed: "just now," "4 minutes ago," "over one hour ago," "one day ago." Exact timestamps are false precision for a rate that moves every second; what matters is whether the number is current or stale. It re-renders every 30 seconds.

### Palette

Greens on a light mint canvas, white wells, one dark ink, forest green for the drag grip and the light green refresh button. The two assets share the same color. The split is a proportion, not a pair of brands, and color is left for the one action on the page.

### Layout

Below 1024px the screen stays one column, in the order you use it: amount, split, quote. That column is the window, not a phone frame floated in the margin. Type comes from the card (`@container`), and the amount steps down again if the typed number would overflow, so a figure like `£ 3,333,333` stays one line.

From 1024px the quote sits beside the amount and the split. That is the content that wants the extra width. The group stops growing at 72rem so an ultrawide window does not turn the drag track into a scrollbar. The track is shown only when the split card is wide enough to drag; narrower than that, the percents are two stacked, linked fields.

### Accessibility

Every number field is a `spinbutton`: arrows step by 1, Shift+arrows by 10, and only digits are accepted. They are text inputs rather than `type="number"`, which accepts `e` and loses the caret when the value is regrouped. The drag grip is a `slider` with arrows and Home/End. The currency list opens and moves with the arrow keys and closes with Escape. Clicking anywhere in a field, including the `%`, focuses it. The quote announces through a visually hidden live region that updates only when the settled figures change, not on every animation frame. The rolling numbers are hidden from assistive tech. Focus is always visible, and `prefers-reduced-motion` turns the quote ease into a snap. Grouping and decimals follow the locale of the selected currency, so the amount you type and the quote you read use the same separators.
