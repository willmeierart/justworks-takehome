# Vue principles

This app is Vue 3 + TypeScript. The notes below are the rules that keep state, HTTP, and the template from fighting each other, written for someone who already thinks in React. Each section states the Vue rule, then the React analog, then the difference that actually changes how you write this screen.

The difference that sits under everything else: **`<script setup>` runs once per component instance**. Vue tracks which refs a computed or template read, and updates only those dependents. A React function component **re-runs on every state change**. That is why React needs dependency arrays, `useMemo`, and `useCallback`, and why Vue mostly does not.

## Single-file components and `<script setup>`

A `.vue` file is one component: script, template, and (rarely) styles in the same file.

`<script setup lang="ts">` is the Composition API in its short form. Bindings declared in the script are automatically available in the template. There is no `export default`, no `setup()` return object, and no `this`.

The older Options API (`data`, `methods`, `computed` as keys on a big object) still works. We do not use it. Options API splits one feature across several option bags; `<script setup>` keeps a feature's state, derived values, and side effects in one place, which is how the rest of the Vue 3 toolchain (composables, Vue Query) is written.

**React analog.** A function component is also one file of logic plus UI. JSX puts the template inside the function. Vue keeps the template in a separate compiled block; the script only declares what the template can read.

**Where they diverge.** React's function _is_ the render. Changing `amount` re-executes `App`. Vue's `App.vue` script does not re-run; the template re-renders from the refs it already closed over. That is closer to a class component's `render()` reading `this.state` than to a hooks function. Options API is the closer analog to class components (`data` -> `state`, `methods` -> class methods). We skip both older styles for the same reason React skipped classes: a feature's state and effects stay together.

`defineProps` / `defineEmits` are compiler macros, not runtime imports. They are the typed equivalent of a React props type plus callback props (`onRetry`). In the template, passing a ref unwraps it (`:rates="rates"`). In React you pass the value from that render (`rates={rates}`).

## `ref`, `computed`, `watch`

- **`ref`** is a mutable box. Read and write `.value` in script; the template unwraps it. Use it for values the user or the network can change: amount, currency, split.
- **`computed`** is a derived value with a dependency list Vue tracks for you. Allocation (fiat x percent x rate) is computed. If the formula can be written as a function of existing refs, it is a computed, not a watch that assigns to another ref.
- **`watch` / `watchEffect`** run side effects when something changes. Side effects in this app are writing `localStorage`, kicking a debounced refetch, measuring the amount field, and publishing the quote after the amount or split has been still. `useDeferred` copies those inputs into refs on a timer. A computed cannot wait, so that copy is the effect: the delay is time, not a second formula for the same number. Watches that copy derived numbers into other refs are the Vue equivalent of `useEffect(() => setX(derive(y)), [y])` -- extra renders and a stale window.

**React analog.**

| Vue                         | React                                                           | Same job                                           |
| --------------------------- | --------------------------------------------------------------- | -------------------------------------------------- |
| `ref` + `.value =`          | `useState` + `setState`                                         | Source of truth the user or the network can change |
| `computed(() => ...)`       | `useMemo(() => ..., deps)`                                      | Value derived from other values                    |
| `watch(source, fn)`         | `useEffect(fn, [source])`                                       | Synchronize with the outside world                 |
| `watchEffect(fn)`           | `useEffect` that should list every read                         | Side effect that depends on whatever it touches    |
| `onMounted` / `onUnmounted` | `useEffect(() => { ...; return cleanup }, [])`                  | Run after the DOM exists, clean up on unmount      |
| `nextTick`                  | waiting until after the current commit (not `useEffect` itself) | Read layout after Vue has patched the DOM          |

**Where they diverge.**

1. **Mutation vs replacement.** `amount.value = 10` updates in place. The ref object identity never changes; subscribers see the new `.value`. React's `setAmount(10)` queues a re-render; the next function call sees a new `amount`. Returning `{ amount }` from a composable is therefore stable. Returning `{ amount }` from a hook is a new object every render unless you `useMemo` it.

2. **Dependency lists.** `computed` and the template record reads as they happen. `useAllocation` can `toValue(amount)` inside a computed and Vue knows to re-run when `amount` changes. `useMemo(() => calculate(amount), [amount])` is correct only if you listed `amount`. Forget a dep and React serves a stale number; Vue will not, because it did not ask you to list one.

3. **`useMemo` is an optimization; `computed` is the derived-state primitive.** In React, `const allocation = calculate(amount, percent, rates)` on every render is fine for this screen. `useMemo` is optional. In Vue, putting that formula in `computed` is the default -- there is no "just run it in the function body again," because the function body does not run again.

4. **When the effect runs.** `watch` does not run on mount unless you pass `{ immediate: true }`. `useEffect` runs after the first paint. `useHoldings` therefore `watch`es the three fields _and_ calls `onMounted(persist)`, so the first write is not skipped. A React port would be one `useEffect` with those three values in the dependency array.

5. **`watch` vs `useEffect` for derived state.** Both ecosystems have the same footgun: an effect that writes back into state. In React that is `useEffect(() => setEth(100 - btc), [btc])`. In Vue it is `watch(btcPercent, (v) => { ethPercent.value = 100 - v })`. Both create a frame where the pair disagree. Ether percent is a `computed` off the Bitcoin percent for that reason.

## `v-model`

`v-model` on a child is a controlled value: the parent owns the ref, the child receives `modelValue` and emits `update:modelValue`. `defineModel()` is the child-side helper that turns that pair into a writable ref.

Named models (`v-model:currency`) exist when a component has more than one controlled field. `AmountInput` owns the amount _and_ the currency because they are one field in the UI. `SplitControl` has a single model, the Bitcoin percent; Ether is computed from it.

**React analog.** A controlled input: `<input value={amount} onChange={e => setAmount(parse(e.target.value))} />`, or a child `AmountInput({ amount, onAmountChange, currency, onCurrencyChange })`. Lifting state to the parent is the same rule.

**Where they diverge.** React makes the two-way binding explicit every time. Vue compiles `v-model="amount"` into the prop/emit pair, so `App.vue` can pass the holdings refs without writing `onUpdate:modelValue`. That is convenience, not a different data-flow: the parent still owns the ref. `defineModel` is not local state that happens to sync; it is the parent's ref, seen from the child. Treating it as private `useState` (updating it without the parent meaning to) is the same bug as a React child calling `onChange` for a reason the parent did not intend.

`v-bind` (`:allocation="allocation"`) and `v-on` (`@retry="refetch()"`) are the one-way forms, and they match React props / `onRetry={refetch}` exactly.

## Composables, not a store

A composable is a function named `useX` that returns refs and functions. Call it from a component's `<script setup>`. It is Vue's hook: same rules about calling it synchronously at the top of setup, same idea of reusing stateful logic.

Pinia is a global store. It is the right tool when two distant trees need the same writable state and a debugging timeline. This app has one screen and two owners of state (`useHoldings`, `useExchangeRates`). A store would add an extra API (actions, store-to-refs) with no second consumer.

**React analog.** Hooks (`useHoldings`, `useExchangeRates`). Pinia is the slot Zustand or Redux occupies; `provide` / `inject` is the slot Context occupies. We use neither, for the same reason a React version of this screen would not wrap itself in a store or a context: one consumer, one tree.

**Where they diverge.** A composable's returned refs keep working after setup because Vue's reactivity is in the ref, not in the call stack. A hook's returned values are only current for that render; the next render is a new call with new locals. That is why `useExchangeRates` can `watch` a `MaybeRefOrGetter` (`toValue(amount)` inside the watcher): the composable subscribed to the caller's ref. A React hook just receives `amount` as a number from the latest render and lists it in an effect dep. `MaybeRefOrGetter` exists so a composable can accept a ref, a getter, or a plain value. React does not need that type -- the argument is always "the value from this render."

Functions returned from a composable (`refetch`) do not need `useCallback`. They close over refs, not over last render's numbers. In React, a function that closes over `amount` is stale unless it is recreated or it reads from a ref.

## Vue Query and the typed client

`@tanstack/vue-query` owns cache, in-flight dedupe, retry, and status. The query key includes currency, so a currency change is a different cache entry and refetches immediately.

The `queryFn` is not a raw `fetch`. It calls `fetchExchangeRates` in `src/api/coinbase.ts`, which:

- passes the `AbortSignal` Query provides so a stale in-flight request does not win
- type-guards the Coinbase JSON so a missing `BTC` / `ETH` rate is our error, not an `undefined` multiplied into a holding

Amount is not part of the query key (the API does not take an amount). Changing the amount still invalidates the current currency's query, debounced, so the quote does not sit on a rate from a minute ago while someone types a large number.

**React analog.** `@tanstack/react-query` is the same library, same cache, same `queryKey` / `queryFn` / `staleTime` / `AbortSignal` contract. A React `useExchangeRates(currency, amount)` would look almost identical.

**Where they diverge.** Because Vue setup does not re-run, the query key has to stay reactive: `queryKey: computed(() => exchangeRatesQueryKey(currencyValue.value))`. In React you write `queryKey: ['exchange-rates', currency]` and the next render passes the new array. Status flags (`isFetching`, `data`) are refs in Vue Query and plain values in React Query; we wrap them in `computed` so the template and `useAllocation` always read `.value` through Vue's tracker. The rest of the decision -- Query plus a typed client, not Query _or_ a typed client -- is identical in both trees.

## Template vs JSX

The template is HTML plus Vue directives. It is compiled, not interpreted at runtime.

- `v-if` / `v-else` -> `{cond ? ... : ...}` or `&&`. Vue will not render the hidden tree; a React `&&` of `0` is a classic footgun Vue does not have.
- `v-for` -> `.map`. Both need a stable `key` (`:key="row.code"` / `key={row.code}`).
- `@click` -> `onClick`. Native events and component emits use the same `@` in the template; React uses `onClick` for DOM and `onRetry` for children by convention.
- Slots -> `children` or a render prop. This app does not use slots.

**Where they diverge.** JSX is JavaScript, so you can `map`, `throw`, or call a function in the middle of the tree. A Vue template cannot; anything non-trivial is a `computed` in the script (`rows` in `AllocationCards`) and the template only walks it. That is a constraint we use on purpose: the quote card does not hide allocation math in the markup.
