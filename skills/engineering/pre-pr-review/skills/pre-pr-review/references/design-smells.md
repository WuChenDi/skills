# Design smells & removal candidates

Load when the diff **adds an abstraction, restructures a module, or grows a file noticeably**. Design feedback on a self-review is advisory — propose the *minimal safe* change, never a rewrite. If a smell needs a non-trivial refactor, note it as a follow-up rather than blocking the commit.

## SOLID smells

- **SRP** — one file now owns unrelated concerns (HTTP + DB + domain rules); ask "what single reason would make this change?"
- **OCP** — adding a variant means editing many `switch`/`if` blocks instead of plugging into an extension point.
- **LSP** — a subclass type-checks for a concrete child, no-ops a parent method, or throws where the base contract promised a result.
- **ISP** — a wide interface forcing implementers to stub methods they don't use.
- **DIP** — high-level logic importing a concrete low-level implementation directly instead of an interface/boundary.

When you propose a split, say *why* it improves cohesion or lowers coupling, and outline the smallest safe step.

## Removal candidates

While walking the diff, also catch what should **leave**:

- Code left **unused** by this change — old branch, replaced helper, dead feature flag.
- Commented-out blocks, "temporary" scaffolding, debug shims.
- A dependency added but not actually called.

Classify each:

- **Safe to delete now** — no references, no active consumers. Delete in this PR (remove code + its tests + its config).
- **Defer with a plan** — still referenced or behind a flag. Note location, why, and the steps + verification (tests/metrics) to remove it later.

Don't delete code your change didn't make dead — flag pre-existing dead code, leave it for a separate change.
