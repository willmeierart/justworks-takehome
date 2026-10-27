# Vue principles

This app is Vue 3 + TypeScript. The notes below are the rules that keep state, HTTP, and the template from fighting each other — written for someone who already thinks in React.

## Single-file components and `<script setup>`

A `.vue` file is one component: script, template, and (rarely) styles in the same file.

`<script setup lang="ts">` is the Composition API in its short form. Bindings declared in the script are automatically available in the template. There is no `export default`, no `setup()` return object, and no `this`.

The older Options API (`data`, `methods`, `computed` as keys on a big object) still works. We do not use it. Options API splits one feature across several option bags; `<script setup>` keeps a feature’s state, derived values, and side effects in one place, which is how the rest of the Vue 3 toolchain (composables, Vue Query) is written.

## `ref`, `computed`, `watch`

- **`ref`** is a mutable box. Read and write `.value` in script; the template unwraps it. Use it for values the user or the network can change: amount, currency, split.
- **`computed`** is a derived value with a dependency list Vue tracks for you. Allocation (fiat × percent × rate) is computed. If the formula can be written as a function of existing refs, it is a computed, not a watch that assigns to another ref.
- **`watch` / `watchEffect`** run side effects when something changes. The only side effects in this app are writing `localStorage` and kicking a debounced refetch. Watches that copy derived numbers into other refs are the Vue equivalent of `useEffect(() => setX(derive(y)), [y])` — extra renders and a stale window.

React mental model: `ref` ? `useState`, `computed` ? `useMemo` that you do not have to list deps for, `watch` ? `useEffect`.

## `v-model`

`v-model` on a child is a controlled value: the parent owns the ref, the child receives `modelValue` and emits `update:modelValue`. Same contract as React’s `value` + `onChange`, with less glue.

Named models (`v-model:currency`) exist when a component has more than one controlled field. We keep components to one model each so the parent stays readable.

## Composables, not a store

A composable is a function named `useX` that returns refs and functions. Call it from a component’s `<script setup>`. It is Vue’s hook: same rules about calling it synchronously, same idea of reusing stateful logic.

Pinia is a global store. It is the right tool when two distant trees need the same writable state and a debugging timeline. This app has one screen and two owners of state (`useHoldings`, `useExchangeRates`). A store would add an extra API (actions, store-to-refs) with no second consumer.

## Vue Query and the typed client

`@tanstack/vue-query` owns cache, in-flight dedupe, retry, and status. The query key includes currency, so a currency change is a different cache entry and refetches immediately.

The `queryFn` is not a raw `fetch`. It calls `fetchExchangeRates` in `src/lib/coinbase.ts`, which:

- passes the `AbortSignal` Query provides so a stale in-flight request does not win
- type-guards the Coinbase JSON so a missing `BTC` / `ETH` rate is our error, not an `undefined` multiplied into a holding

Amount is not part of the query key (the API does not take an amount). Changing the amount still invalidates the current currency’s query, debounced, so the quote does not sit on a rate from a minute ago while someone types a large number.
