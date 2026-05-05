# Refactor Playbook

Use this when the user says "下沉 / 抽出 / 重构 / 复用" or otherwise wants to move logic across the workspace boundary.

## What kind of refactor?

Three patterns dominate, each with a different routine:

| Pattern                                        | Where the new code lives          | Section          |
|------------------------------------------------|-----------------------------------|------------------|
| Multiple apps repeat the same helper           | `packages/utils` (a new module)   | §A — Sink to utils |
| One app has tangled internal modules           | inside the same app, no package   | §B — In-app reorg  |
| A shadcn/ui-style component duplicated         | `packages/ui/src/components`      | §C — Sink to ui    |

If the user's intent doesn't fit, ask which it is.

---

## §A — Sink shared logic to `packages/utils`

### A1 — Confirm it's worth sinking

Before moving anything, sanity-check:

- **Used by ≥ 2 apps**, or about to be? If only one app uses it, leave it there. Premature abstractions in `utils` are worse than duplication.
- **Stable surface**? If the shape is still churning, wait — you'll just churn the package's API too.
- **No app-specific state**? If the function depends on the app's logger / config / store, it doesn't belong in a generic utils package. Either pass dependencies in as arguments or keep it local.

If any answer is "no", abort and tell the user why.

### A2 — Pick the home

`packages/utils/src/` is organized by capability:

- `clipboard/`, `download/`, `format/`, `idb-store/`, `logger/`, `np/` (numerical-precision math)

Reuse an existing folder when the new helper fits one. Add a new folder only when the capability is genuinely new (e.g. `cache/`, `cron/`).

### A3 — Move and re-export

1. Create the new file under `packages/utils/src/<capability>/<name>.ts`.
2. Add tests next to it (`<name>.test.ts`) using vitest.
3. Re-export from `packages/utils/src/index.ts` so consumers can `import { x } from '@cdlab996/utils'`. (If subpath exports are configured, also re-export from the subpath barrel.)
4. Build the package: `pnpm --filter @cdlab996/utils build` (or `dev --watch` if you'll iterate).
5. In each consumer app, replace the local copy with `import { x } from '@cdlab996/utils'`.
6. Delete the now-unused local file. Run `pnpm --filter @cdlab996/<app> typecheck` to confirm no orphaned imports.

### A4 — Verify

```bash
pnpm --filter @cdlab996/utils test
pnpm --filter @cdlab996/utils build
# every consumer
pnpm --filter @cdlab996/<consumer-1> typecheck
pnpm --filter @cdlab996/<consumer-2> typecheck
# root smoke
pnpm lint:biome
pnpm build
```

### A5 — Commit shape

Two commits, in this order:

```
refactor(utils): extract <name> from <app1>, <app2>
refactor(<app1>, <app2>): consume <name> from @cdlab996/utils
```

The first commit adds the new code + tests; the second deletes duplicates and switches imports. This makes review easier — reviewer can verify the extraction is faithful before checking the migration.

(In practice the repo sometimes squashes these into one commit. Use your judgment; if the diff is small, one commit is fine.)

---

## §B — In-app reorganisation

Moving files / renaming directories within one app, not crossing package boundaries.

### B1 — Decide the new shape first

Don't move files before you know the target structure. Sketch it out (in the conversation, not in a doc):

```
src/
├── core/managers/         (existing)
├── services/              (existing)
└── stores/                (existing)
```

Then identify what changes and why. Vague rationales like "it's cleaner" are red flags — push the user to articulate the concrete benefit (testability, locality, dependency direction).

### B2 — Move in one commit per logical group

A pure rename / move should land in **one commit per logical group**, with no behavior change. If you change behavior in the same commit, splitting them later becomes painful.

### B3 — Update imports atomically

- Use the editor's "rename file" / "move file" rather than `git mv` + manual import edits when possible.
- After every move, run `pnpm --filter @cdlab996/<app> typecheck` before continuing. Don't accumulate broken intermediate states.

### B4 — Verify

```bash
pnpm --filter @cdlab996/<app> typecheck
pnpm --filter @cdlab996/<app> lint
pnpm --filter @cdlab996/<app> build
# Boot dev once and exercise the path you reorganized
pnpm --filter @cdlab996/<app> dev
```

### B5 — Commit shape

```
refactor(<app>): reorganize <subsystem> into <new-shape>
```

Body explains *why*. The diff should be ~99% renames + import path edits. If you see real logic changes, you accidentally bundled a feature change into the refactor — split it.

---

## §C — Sink a UI component to `packages/ui`

### C1 — Confirm it fits the package's style

`packages/ui` is a no-build, source-only library. Components are shadcn/ui-flavored: primitive, unopinionated, take all data via props, no app-specific imports.

If the component pulls from an app's Zustand store or makes API calls, it doesn't belong here yet — split the presentational layer out first, then sink only the dumb part.

### C2 — Move to the right subpath

- `packages/ui/src/components/<name>.tsx` for shadcn-derived primitives
- `packages/ui/src/hooks/<name>.ts` for hooks
- `packages/ui/src/lib/<name>.ts` for utilities
- `packages/ui/src/IK/<name>.tsx` / `reactbits/<name>.tsx` only for vendored sets — don't add ad-hoc files here

`packages/ui/src/components/**/*.tsx` and `reactbits/**/*.tsx` are **excluded from Biome** (third-party-derived). Don't try to lint them; if you do edit one, keep the original style.

### C3 — Update consumers

```ts
// before:
import { Button } from '@/components/ui/button'

// after:
import { Button } from '@cdlab996/ui/components/button'
```

`packages/ui` has no build step — consumers pick up the new file the moment it lands (subject to the consuming app's bundler reading `node_modules/@cdlab996/ui/src/`, which is configured by `paths` in tsconfig).

### C4 — Delete the duplicates

After migrating imports in every consumer, delete the local copies. Run `pnpm --filter @cdlab996/<app> typecheck` per app.

### C5 — Verify and commit

```bash
pnpm --filter @cdlab996/<consumer-1> typecheck
pnpm --filter @cdlab996/<consumer-2> typecheck
pnpm build
```

```
refactor(ui): consolidate <Component> into shared library
```

---

## When to *not* refactor

Push back if:

- The user wants to "clean up" code they didn't write and there's no concrete bug or hand-off pressure.
- The refactor would touch ≥ 5 files for a stylistic improvement (variable rename, file split). The cost of review usually exceeds the benefit.
- The duplication is shallow — three near-identical lines is not "duplication" worth abstracting. Three identical 30-line functions is.

When in doubt, point the user at the duplication, name the cost (X files touched, Y test cases to verify), and ask if it's worth doing now.

## Common pitfalls

- **Refactoring + adding a feature in the same commit** — split them. Always.
- **Sinking a "helper" that depends on the consuming app's logger or config** — pass deps in, or keep the helper local.
- **Forgetting to rebuild `packages/utils`** — consumers pull stale `dist/` and you waste 20 minutes diagnosing.
- **Moving a file but missing the test next to it** — orphan test file, CI fails on the next run.
- **Using `git mv` then forgetting to update import paths** — typecheck catches this, but only if you run it.
