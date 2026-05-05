# projects-maintainer

Personal maintenance skill for [`@cdlab996/projects-monorepo`](https://github.com/WuChenDi/projects). Bundles flow-oriented playbooks + scaffolding templates so day-to-day work in the repo (or in a new repo cloning this style) lands consistently without re-deriving conventions every time.

Not designed to be a generic monorepo helper. Everything is anchored to the actual apps in the repo (baccarat, byplay-log, dropply-api/web, flox, SecureC, shortener, …).

## What it covers

| Intent                    | Reference                              |
|---------------------------|----------------------------------------|
| Scaffold a new app        | `references/new-app.md` + `assets/templates/{nextjs-app,worker-app,nuxt-app}` |
| Scaffold a shared package | `references/new-package.md` + `assets/templates/package` |
| Upgrade dependencies      | `references/deps-upgrade.md`           |
| Cross-app refactor        | `references/refactor.md`               |
| Add a feature to an app   | `references/new-feature.md`            |
| Review a change           | `references/code-review.md`            |
| Sync `CLAUDE.md` / README | `references/update-docs.md`            |

The shared technical baseline (`stack.md`, `conventions.md`) is loaded only when needed.

## Stack baked in

The cdlab projects baseline:

- pnpm workspaces with two catalogs (`prod`, `dev`)
- Turborepo with concurrency 50
- Biome (single quotes, no semicolons, `useImportType` separated, `noFloatingPromises`, `noTsIgnore`, zod `import * as z`)
- `@nsio/nsl` dev proxy (`http://<name>.localhost:3355`)
- Cloudflare Pages / Workers / D1 + Drizzle (`DB_TYPE=libsql|d1`)
- Next.js (App Router) for browser apps, Hono for Workers, Nuxt 4 for the dashboard
- `next-intl` (`en`/`zh`) by default
- Conventional Commits, English remote-visible metadata

## Install

```bash
claude --plugin-dir ./skills/projects-maintainer
```

Triggers automatically when you say things like:

- "新建一个 worker / 加个 next 应用"
- "bump catalog / 升级依赖 / wrangler compatibility_date"
- "把这段逻辑下沉到 packages/utils"
- "提 PR 之前帮我自检 / 跑一下 lint"
- "更新 CLAUDE.md"

## Directory layout

```
projects-maintainer/
├── .claude-plugin/plugin.json
├── README.md
└── skills/projects-maintainer/
    ├── SKILL.md               # router + style cheatsheet
    ├── references/            # detailed playbooks (loaded on demand)
    └── assets/
        ├── templates/         # minimal app/package skeletons
        └── snippets/          # standard biome / tsconfig / turbo / workspace files
```

## License

MIT
