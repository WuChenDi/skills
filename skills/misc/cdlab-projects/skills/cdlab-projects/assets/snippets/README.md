# Snippets

Reference configuration files. Copy whole or borrow specific blocks when scaffolding a new monorepo or aligning an existing one.

| File                  | What it's for                                   |
|-----------------------|--------------------------------------------------|
| `biome.json`          | Root Biome config (lint + format + domains)     |
| `pnpm-workspace.yaml` | Workspace globs + dual catalogs (prod / dev)    |
| `turbo.json`          | Turborepo task pipeline                         |
| `tsconfig-base.json`  | Shared base TS config (extend in apps/packages) |
| `tsconfig-nextjs.json`| Next.js overlay config                          |
| `tsconfig-hono.json`  | Workers (Hono) overlay config                   |
| `tsconfig-utils.json` | Library / utility overlay config                |

These mirror the `cdlab projects` baseline. When the upstream repo evolves (e.g. a new lint rule or catalog version), bump these too.
