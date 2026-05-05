# Conventions Reference

Rules and patterns that should hold across every package and app. Read this when you're unsure whether some choice matches the project style.

## Code style

- Single quotes, no semicolons, 2-space indent. Biome handles formatting.
- `import type { X } from '…'` — the `useImportType` rule is set to `separatedType`. Mixing types and values in one import statement fails lint.
- `import * as z from 'zod'` is mandatory. `import { z } from 'zod'` is blocked by `noRestrictedImports`.
- Every async call is awaited or explicitly `void`-ed. `noFloatingPromises` and `noMisusedPromises` are errors.
- Use `// @ts-expect-error <reason>`, never `// @ts-ignore`. Always include a brief reason.
- `Date.now()` instead of `new Date().getTime()` (`useDateNow` is an error).
- No `delete obj.prop` (`noDelete` is an error). Set `obj.prop = undefined` or restructure.
- Unused imports surface as warnings (`noUnusedImports`); fix them — don't add `// biome-ignore` to silence them.
- `noImplicitAnyLet` is a warning — type your `let` declarations.

## Lint domain overrides

`biome.json` enables domain-specific rules per app:

```jsonc
"overrides": [
  {
    "includes": ["apps/<react-app>/**/*"],
    "linter": { "domains": { "next": "recommended", "react": "recommended" } }
  },
  {
    "includes": ["apps/<vue-app>/**/*"],
    "linter": { "domains": { "vue": "recommended" } }
  }
]
```

When you add a new app, add it to the right `overrides` block. If it's a Worker (no UI domain), it falls under the recommended-off baseline and needs no override.

## Files Biome should ignore

The root `biome.json` `files.includes` is an allow-list with `!` negations for build artifacts plus a few app-specific carve-outs:

- All build output: `dist`, `build`, `public`, `.next`, `.out`, `.wrangler`, `.turbo`, `.cache`
- `apps/repo-changelog/**` — Nuxt 4 has its own ESLint config
- `apps/<worker>/src/database/**/*.{json,sql}` — generated migration artefacts
- `packages/ui/src/{components,reactbits}/**/*.tsx` — shadcn/reactbits-derived sources

When you add a new app or package that emits generated code or vendors third-party templates, extend `files.includes` accordingly.

## Dependencies

- **Catalogs are the source of truth.** `pnpm-workspace.yaml` declares two: `prod` (runtime libs the app ships) and `dev` (build/test/types). Reference as `"react": "catalog:prod"` / `"typescript": "catalog:dev"` in `package.json`.
- **Bumping a shared dep** = edit `pnpm-workspace.yaml`, not each `package.json`. Every consumer picks it up on `pnpm install`.
- **Adding a new dep**:
  - If multiple apps will use it, put it in the right catalog and reference `catalog:prod|dev`.
  - If only one app needs it, you may add it as a literal version in that app's `package.json`. If a second app picks it up later, promote it to the catalog at that point.
- **Cross-package imports** use the workspace protocol: `"@cdlab996/utils": "workspace:*"`.
- **tsdown-built packages** (`utils`, `cipher`, `uncrypto`) ship from `dist/`. After editing, run `pnpm --filter @cdlab996/<pkg> build` (or `dev --watch`) so consumers see the change. `pnpm prepare` (auto-run after install) builds them in topological order.

## Workspace package metadata

Every `package.json` (apps and packages) carries this header:

```json
{
  "name": "@cdlab996/<kebab-name>",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "description": "<one-line>",
  "author": "wudi <wuchendi96@gmail.com>",
  "license": "MIT",
  "homepage": "https://github.com/WuChenDi",
  "repository": {
    "type": "git",
    "url": "https://github.com/WuChenDi/projects.git",
    "directory": "<apps|packages>/<name>"
  }
}
```

Apps additionally use `version: "0.1.0"` if they're pre-1.0.

## Scripts conventions

- Dev: `nsl run <tool> dev` — never bare `next dev` / `wrangler dev` / `nuxt dev`.
- Typecheck: `tsc --noEmit` (Next, Workers) or `nuxt typecheck` (Nuxt) or `tsc --project ./tsconfig.json --noEmit` (packages).
- Lint per-app: `lint` script on each app, delegated by `turbo lint` at the root.
- Build: `build` exists everywhere; the deploy step is **explicit** (`turbo deploy`) and **does not auto-deploy from CI**.

## i18n (next-intl)

- Files: `apps/<app>/messages/{en,zh}.json`. Both files must define every user-visible key.
- Route layout: `app/[locale]/…`. The locale segment is wired through `middleware.ts` (the next-intl locale middleware).
- Generated artefact `apps/*/messages/en.d.json.ts` is gitignored and excluded from Biome.
- When adding an i18n app, also add its `messages/` path to `i18n-ally.localesPaths` in `.vscode/settings.json` so the IDE picks it up.

## API response envelope (Workers)

For errors:

```ts
{ statusCode: number, message: string, stack?: string[] }
```

`stack` is included only when `globalThis.isDebug === true`. The same shape is returned by the global `app.onError` and `app.notFound` handlers in `src/index.ts`.

For success, use whatever shape fits the route — but be consistent inside a single app.

## Soft delete

Tables share a `trackingFields` block:

```ts
const trackingFields = {
  createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date()).notNull(),
  isDeleted: integer({ mode: 'boolean' }).default(false).notNull(),
}
```

**Never hard-delete.** Every read filters `eq(table.isDeleted, false)` (or `0`). The cleanup cron may eventually purge old soft-deleted rows, but the application code never calls `db.delete()` on a user-facing table.

## Cache invalidation (apps that use Cloudflare KV)

When a record has multiple cache keys (`url:{hash}`, `og:{hash}`, `ai:slug:{url}` in `shortener`), invalidate all of them in the same operation. Three-key invalidation that drifts apart will leak stale data.

## Commits

- Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, `build`, `test`, `style`, `perf`, `ci`).
- Optional scope = the affected app or package: `feat(shortener): …`, `chore(deps): …`, `refactor(utils): …`.
- Subject in imperative mood, English, ≤ 72 chars. Body wraps at 100.
- No mention of AI assistants, model names, or co-authored-by trailers in any remote-visible Git metadata (commits, PR titles, PR bodies, comments).
