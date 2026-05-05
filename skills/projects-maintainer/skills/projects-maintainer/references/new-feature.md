# New Feature Playbook

Use this when adding a feature to an existing app. The goal: the new feature feels like it was always there.

## Step 1 — Read the app's local conventions before writing anything

Each app has its own internal style. Spend 2-3 minutes with these before touching code:

- The app's `README.md` (if any)
- The relevant section of root `CLAUDE.md` (under `## Architecture`)
- 2-3 representative files near the area you're changing (one component, one route, one store)

Look for:

- **Module / layer organization** — Workers split routes into `src/routes/<group>.ts`. Next apps split UI into `src/components/<feature>/`. ByCut uses singleton-style "managers" (`src/core/managers/<thing>-manager.ts`). Match the local pattern.
- **State shape** — Zustand stores follow a per-feature convention (`<thing>-store.ts`). If you need persistent state, check whether the app uses `persist` middleware.
- **Dependencies already present** — if the app uses `@tanstack/react-query`, don't bring in a second data-fetcher. If it uses `@hono/zod-validator`, write your route validator with it, not bare zod.
- **Existing patterns for similar features** — there's almost always a precedent. Copy it.

If the app has none of this and is genuinely small, fall back to the conventions in `references/conventions.md`.

## Step 2 — Plan the change in one sentence each

Before editing, name out loud:

1. **What user-visible behavior changes** — one sentence.
2. **What files you'll touch** — list paths.
3. **What can break** — name the most likely regression area.

If the user gave you a 3-paragraph spec but the change is small, it's still worth narrowing it down to these three lines. If you can't, you don't understand the task yet.

## Step 3 — Write the smallest version that works

- No extra config options "in case we need them".
- No abstractions for code with one caller.
- No defensive error handling for situations that can't happen (Workers won't suddenly run in Node; client code won't suddenly run on the server).
- If you find yourself adding a flag named `enableX`, ask whether X always wants to be enabled — usually yes, kill the flag.

## Step 4 — Touch the right surfaces

### Workers (Hono)

- Route file under `src/routes/<group>.ts`. Compose into the app via `src/routes/index.ts`.
- Validation via `@hono/zod-validator`. Schema lives next to the route or in `src/lib/validationSchemas.ts` if shared.
- DB access through Drizzle. Always filter by `eq(table.isDeleted, false)`. Never call `db.delete()`.
- New env var? Add it to:
  - `wrangler.jsonc` `vars` block (with a placeholder)
  - `.env.example` (real local default)
  - `src/types.ts` if there's a typed `createConfig(env)` pattern in this app
- New error? Throw `HTTPException` with a status; the global `onError` will format it.
- Cron job? Add a function under `src/cron/`, then wire `scheduled()` in `src/index.ts`. Schedule lives in `wrangler.jsonc` `triggers.crons`.
- Durable Object? New class file under `src/durable-objects/<name>.ts`, registered in `wrangler.jsonc` `durable_objects.bindings` and `migrations`. SQLite-backed DOs use `new_sqlite_classes` migrations.

### Next.js

- Page route: `app/<route>/page.tsx`, plus optional `loading.tsx`, `error.tsx`. With i18n: `app/[locale]/<route>/page.tsx`.
- Server route handler: `app/api/<name>/route.ts`. If the data is simple and read-only, prefer a Server Component; route handlers earn their place when there's a real RPC reason.
- Client UI piece: `src/components/<feature>/<Name>.tsx`. Group by feature, not by type. `'use client'` only on the components that actually need it.
- State: Zustand store in `src/stores/<feature>-store.ts`. Persist only when the user expects state across reloads; everything else is in-memory.
- Data fetch: TanStack Query if the app already uses it; otherwise Server Components / `fetch` in route handlers.
- Strings: every user-visible string goes into `messages/{en,zh}.json`. Don't ship hardcoded `'Save'` / `'保存'` buttons.

### Nuxt

- Page: `app/pages/<route>.vue`. Route is automatic.
- Component: `app/components/<Name>.vue`.
- Composable: `app/composables/use<Thing>.ts`.
- Server data: `shared/types/` for shared types; `runtimeConfig` for env wiring.

## Step 5 — Verify

```bash
pnpm --filter @cdlab996/<app> typecheck
pnpm --filter @cdlab996/<app> lint
pnpm --filter @cdlab996/<app> dev      # boot once, exercise the new path
```

For Workers, also `pnpm --filter @cdlab996/<app> build` to catch issues that `wrangler dev` doesn't surface (e.g. unused exports the bundler complains about).

If the app has tests for the area you touched, run them. If it doesn't and the feature has non-trivial logic, **add a test** — even a single one — at the boundary you most worry about. (Test infrastructure: vitest + happy-dom for browser-side, vitest in Node for Workers logic.)

## Step 6 — Smoke test the actual feature

Don't claim done after typecheck. Manually exercise the golden path:

- Workers: `curl` the new endpoint with realistic payloads. Hit one error path too.
- Next: load the page in the browser, click through the new control, watch the DevTools console for warnings.
- Nuxt: same as Next.

If the feature has a regression risk on adjacent UI (e.g. you added a route that the navbar links to), check that the navbar still works.

## Step 7 — Commit

Conventional Commits. The scope is the affected app or sub-area.

```
feat(<app>): <short imperative>
```

Body (if needed) explains *why* and any trade-off the reviewer should know. Don't restate the diff.

If the feature touches multiple unrelated areas of the app, split into multiple commits.

## Common pitfalls

- **Reaching for a new dep when the existing one would do** — check the app's `package.json` and `references/stack.md` first.
- **Hardcoding strings in an i18n app** — they need keys in both `en.json` and `zh.json`.
- **Forgetting `await` on a fire-and-forget call** — `noFloatingPromises` will fail lint. If the call genuinely is fire-and-forget, mark it `void <call>` with a comment.
- **Using `import { z } from 'zod'`** — fails Biome. Always `import * as z from 'zod'`.
- **Adding a feature flag that's never going to be flipped off** — just commit the behavior change directly.
- **Adding a database column without a migration** — `pnpm --filter <worker> db:gen` after every schema edit. The migration file *is* the schema diff.
- **Storing the encryption key on the server** — for `dropply-*` and `SecureC`, the server must never see plaintext or keys. Re-read the app's section in `CLAUDE.md` if you're touching crypto.
