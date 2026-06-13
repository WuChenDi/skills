# Quality & boundary scan

Load for any **non-trivial logic** change. These are the silent-failure and production-incident bugs that typecheck and lint pass right over.

## Error handling

- **Swallowed exceptions** — empty `catch {}`, or catch that only logs and continues as if nothing failed.
- **Over-broad catch** — catching the base `Exception` / `Error` where a specific type was meant, hiding unrelated failures.
- **Missing handling** — no guard around fallible I/O, network, or parse calls.
- **Async holes** — unhandled promise rejection, missing `.catch()` / `await`, no error boundary.
- Recoverable errors with no defined fallback; critical errors that don't surface to logs/monitoring.

## Performance

- **N+1** — query or network call inside a loop that could be batched.
- CPU-heavy work on a hot path (request handler, render loop) with no cache/memoization.
- Unbounded memory — accumulating into a collection that grows with input size and is never bounded or streamed.

## Boundary conditions

- **Null / undefined** — value assumed present that an upstream change can now make absent.
- **Empty collection** — code that assumes ≥1 element (first/last access, `reduce` without seed).
- **Numeric edges** — off-by-one in ranges, integer overflow, division by zero, float compared with `==`.
- **String edges** — empty string, encoding/locale assumptions, length used as byte count.

Flag anything that fails **silently** over anything that fails loudly — a crash gets noticed, a wrong-but-quiet result does not.
