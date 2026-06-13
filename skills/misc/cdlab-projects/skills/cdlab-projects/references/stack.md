# Stack Reference

The opinionated tech stack assumed by this skill. Read this when you need to know "what should I reach for" before writing code.

## Workspace

- **Package manager**: pnpm (pin `packageManager` in root `package.json`).
- **Monorepo**: Turborepo (`turbo.json`, concurrency 50, `ui: tui`).
- **Layout**: `apps/*` for deployables, `packages/*` for shared libraries. Both globs in `pnpm-workspace.yaml`.
- **Catalogs**: two catalogs — `prod` (runtime) and `dev` (build/test/types). Reference as `catalog:prod` / `catalog:dev` from any package.json.

## Lint / format

- **Biome only** — do not introduce ESLint or Prettier. The single `biome.json` at the root governs everything except `apps/repo-changelog/**` (excluded; Nuxt has its own ESLint).
- Per-app lint domains (Next/React, Vue) are enabled via `biome.json` `overrides` rather than per-app config files.

## TypeScript

- Shared configs in `packages/tsconfig`:
  - `base.json` — strict, NodeNext, ES2017
  - `nextjs.json` — Next overlay (extends base)
  - `hono.json` — Workers overlay (extends base)
  - `react-library.json`, `utils.json` — for shared packages
- Each project just `extends` one of these and adds `paths` / `types`.

## Frontend frameworks

| Framework      | Apps using it                                 | Build tool                   | Deploy                                                                |
|----------------|-----------------------------------------------|------------------------------|-----------------------------------------------------------------------|
| Next.js (App Router) | most front-ends                         | `next build` (or `--webpack` when wasm/workers misbehave with Turbopack) | Cloudflare Pages via `@cloudflare/next-on-pages`, occasionally `@opennextjs/cloudflare` |
| Cloudflare Workers + Hono | API / serverless apps               | `wrangler deploy --minify`   | Workers + Durable Objects + D1                                        |
| Nuxt 4 (Vue 3) | content / dashboard apps                      | `nuxt build` / `generate`    | Vercel                                                                |

## Shared UI / utilities

- **`@cdlab996/ui`** — React + Tailwind v4 component library. **No build step**; consumers import raw source via subpath exports (`@cdlab996/ui/components/<name>`, `@cdlab996/ui/hooks/<name>`, etc.). Adding a component just means dropping a `.tsx` into `src/components/`.
- **`@cdlab996/utils`** — generic helpers (`clipboard`, `download`, `format`, `idb-store`, `logger`, `np`). Built with `tsdown`. Consumers import from `dist/index.mjs` and need a rebuild after edits (`pnpm --filter @cdlab996/utils build` or `dev --watch`).
- **`@cdlab996/cipher`** — XChaCha20-Poly1305 + Argon2id stream crypto. Used by encryption-heavy front-ends.
- **`@cdlab996/uncrypto`** — runtime shim selecting Node `webcrypto` vs browser `crypto`. Two-file build (`crypto.node.ts`, `crypto.web.ts`) via tsdown.
- **`@cdlab996/tsconfig`** — see above.

## Storage / DB

- **Drizzle** for any persistent store inside a Worker.
- **Two-dialect setup**: a single `drizzle.config.ts` factory that reads `DB_TYPE` (`libsql` for local Turso file or remote LibSQL, `d1` for Cloudflare D1).
- Schema in `src/database/schema.ts`; migrations land in `src/database/` (not `drizzle/`) so `wrangler d1 migrations apply` finds them.

## Auth / crypto / IDs

- **IDs**: `@cdlab996/genid` (catalog dep) for general-purpose IDs. UUID v4 for sessions; `sha256` hash + `shortCode` for the URL shortener.
- **Auth on Workers**: `jose` for ES256 JWT verification, mounted as middleware on `/api/*` only.
- **End-to-end encryption**: AES-GCM + Argon2id with the key in the URL fragment (server never sees it) for `dropply`; XChaCha20-Poly1305 for `SecureC`.

## Dev proxy

- `@dotns/nsl` — every app is reachable at `http://<app-name>.localhost:3355` once dev is running. Don't add port-juggling logic.
- Each app's dev script is `nsl run <tool> dev` (`next dev`, `wrangler dev src/index.ts`, `nuxt dev`).

## Logging

- **Workers**: `globalThis.logger` is set in `src/global.ts`. On Cloudflare it's a thin wrapper around `console.*`; in Node test runs it's winston with daily rotation. Both expose the same `debug/info/warn/error` shape.
- **Front-end**: `@cdlab996/utils/logger` for browser-side logging; otherwise `console.*` is fine.

## Observability

- Workers: `wrangler.jsonc` → `observability: { enabled: true, head_sampling_rate: 1 }`. Always on by default.
- Custom analytics: `shortener` uses Cloudflare Analytics Engine + `ua-parser-js`.
