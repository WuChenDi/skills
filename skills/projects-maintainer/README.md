# projects-maintainer

A Claude Code skill for continuously maintaining a personal Turborepo + pnpm monorepo in the **cdlab projects** style. It bundles flow-oriented playbooks (six common maintenance tasks) plus minimal scaffolding templates so you can drop a new app or package into any monorepo without re-deriving conventions from scratch.

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

- pnpm workspaces with two catalogs (`prod`, `dev`)
- Turborepo with concurrency 50
- Biome (single quotes, no semicolons, `useImportType` separated, `noFloatingPromises`, `noTsIgnore`, zod `import * as z`)
- `@nsio/nsl` dev proxy (`http://<name>.localhost:3355`)
- Cloudflare Pages / Workers / D1 + Drizzle (`DB_TYPE=libsql|d1`)
- Next.js (App Router), Hono Workers, Nuxt 4
- `next-intl` (`en`/`zh`) when an app needs i18n
- Conventional Commits

## Install

```bash
# from this skills repo
claude --plugin-dir ./skills/projects-maintainer
```

After loading, the skill triggers on phrases like:
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
