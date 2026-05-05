# Code Review Playbook

Use this before commit / before opening a PR — or when the user asks "帮我自检一下". The goal is to catch the things automated tools won't, and run the things they will.

## Step 1 — Pull the diff

```bash
git status
git diff                    # working tree
git diff --staged           # staged
git diff main...HEAD        # whole branch since branching off main
```

Read the diff before touching any tool. A 200-line diff from a 1-line task is usually a hint of scope creep — call it out.

## Step 2 — Run the automated layer

In this order; stop on first hard failure and fix the root cause:

```bash
pnpm lint:biome                                          # root, full repo
pnpm --filter @cdlab996/<changed-pkg-or-app> typecheck   # per touched workspace
pnpm --filter @cdlab996/<changed-pkg-or-app> lint        # if app has its own lint
pnpm --filter @cdlab996/<changed-pkg-or-app> test        # if tests exist
pnpm --filter @cdlab996/<changed-pkg-or-app> build       # final smoke
```

For multiple packages, repeat per filter — Turbo will skip unaffected ones, so it's cheap.

If any lint rule fails, **fix the code, not the rule**. Don't add `// biome-ignore` lines unless there's a genuine reason (and write the reason in the comment).

## Step 3 — Read the diff with the conventions checklist

Walk through the diff and check, mentally:

### Style

- [ ] Single quotes, no semicolons, 2-space indent — Biome will catch most, but eyeball anyway.
- [ ] `import type { … }` separated, never `import { type … }`.
- [ ] `import * as z from 'zod'` (if the file uses zod).
- [ ] No `// @ts-ignore` — only `// @ts-expect-error <reason>`.
- [ ] No `delete obj.prop`. No `new Date().getTime()`.
- [ ] Every async call is awaited or `void`-ed.

### Dependencies

- [ ] No new literal version pin for a dep that already lives in the catalog.
- [ ] If a dep is added to one app's `package.json`, would another app likely want it too? If yes, promote to catalog now.
- [ ] Cross-package import uses `workspace:*`, not a literal version.
- [ ] If a `packages/*` library was edited, was it rebuilt? (`pnpm prepare` or per-package `build`.)

### Architecture

- [ ] New code lives in the right layer (Workers: routes / lib / cron; Next: components / stores / lib).
- [ ] No app-specific logic leaked into `packages/utils` or `packages/ui` (they should stay app-agnostic).
- [ ] No duplicated helper that already exists in `@cdlab996/utils` / `@cdlab996/ui`.
- [ ] If a Worker touches the DB: filtered by `isDeleted = false`, no `db.delete()`, soft-delete on writes.
- [ ] If a Next app uses i18n: every new string has keys in both `en.json` and `zh.json`.
- [ ] New env vars are declared in `wrangler.jsonc` `vars` (with placeholder), `.env.example`, and `src/types.ts` if the app has a typed `createConfig`.

### Tests

- [ ] If the change is non-trivial logic in a `packages/*` library — is there a test?
- [ ] If the change touches a Worker's request flow — is there a smoke curl in your verification log?
- [ ] If the change is UI — did you actually load the page once?

### Commits

- [ ] Subject in Conventional Commits form (`feat`, `fix`, `chore`, `refactor`, `docs`, `build`, `test`).
- [ ] Scope (when meaningful) is the app or package: `feat(shortener): …`, `chore(deps): …`.
- [ ] Subject is imperative, English, ≤ 72 chars.
- [ ] No mention of AI assistants / model names / co-authored-by trailers.

### Surface area

- [ ] Every touched file traces back to the user's request. If a file changed for a reason you can't articulate in one sentence, revert that hunk.
- [ ] No drive-by reformat of unrelated code.
- [ ] No `console.log` left over (unless the file uses `console.*` deliberately for Worker logging).
- [ ] No `.only`, `.skip`, `xit`, debugger statements left in tests.

## Step 4 — Check what isn't in the diff but should be

This is the thing automated tools won't catch:

- New app added but `biome.json` `overrides` not updated → Biome silently skips lint domain rules.
- New i18n strings added in `en.json` but not `zh.json` (or vice versa) → broken locale at runtime.
- New deps in `package.json` but not used anywhere yet → bloat. Either use them or remove them before merge.
- Drizzle schema edited but `pnpm db:gen` not run → migration missing, prod will crash.
- Worker route added but not registered in `src/routes/index.ts` → 404 in prod.
- New CF binding (KV/D1/AI) added in code but not in `wrangler.jsonc` → runtime error.
- Significant architectural change but `CLAUDE.md` not updated → drift starts.

For each, scan the diff one more time looking specifically for the missing piece.

## Step 5 — Decide and report

After all the above, give the user a compact verdict:

```
Verdict: green / yellow / red

Green  — passes all checks, ready to commit.
Yellow — passes automated checks, but: <1-2 specific concerns>.
Red    — fix these before commit: <specific failures>.
```

Then either commit (if asked, and verdict ≥ green) or hand it back.

## When the user asks for "review", not "self-review"

If the user is asking you to review **someone else's** PR or branch (not their own work):

- Lead with what's correct — reviewers who only list problems are exhausting.
- Then list concerns, ranked by severity (correctness > design > style).
- Be specific: file paths and line numbers, not vague "consider refactoring".
- For style nitpicks that Biome would catch: don't bother — Biome will catch them. Focus your time on what Biome can't.
- Don't ask "why did you do it this way?" rhetorically — either propose a concrete alternative, or accept that the choice was deliberate.

## Common pitfalls

- **Trusting a green typecheck** — typecheck doesn't catch missing migrations, missing i18n keys, missing wrangler bindings. Use the §4 checklist.
- **Suppressing a Biome rule** to silence a single warning — usually the warning is right.
- **Letting a "Major bump" sneak in via `pnpm install` mass-update** — read `pnpm-lock.yaml` diff for unexpected jumps.
- **Stamping a commit message on top of unrelated staged changes** — `git diff --staged` before commit, every time.
