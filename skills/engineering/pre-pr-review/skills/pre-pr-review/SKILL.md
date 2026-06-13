---
name: pre-pr-review
description: Pre-commit / pre-PR self-review of your own changes. Trigger when the user asks to "review my changes", "self-review", "sanity-check this branch", "look at the diff before I commit", "before I push", or otherwise wants a check on the branch they're about to ship. Pulls the diff, walks a surface-area checklist, runs a depth-scaled risk scan, scans for missing co-changes (X-implies-Y), and renders a green/yellow/red verdict. Skip when reviewing **someone else's** PR (different mode — see §Reviewing others) or when the user has already committed and wants a post-hoc audit.
metadata:
  author: wudi
  version: "2026.06.13"
  source: https://github.com/WuChenDi/skills
---

# pre-pr-review

Disciplined self-review before commit / before PR. The goal is to catch what automated tools won't, and to run the things they will.

This skill is **stack-agnostic**. It will not tell you which lint / typecheck / test commands to run — that depends on the project. Use the project's `CLAUDE.md` (or equivalent) for the exact commands; this skill provides the *thinking framework*.

## Step 1 — Pull the diff

```bash
git status
git add -N .                     # intent-to-add: surfaces untracked new files in the diff (without staging them)
git diff                         # working tree
git diff --staged                # staged

# Auto-detect the default branch instead of hardcoding main/master/develop:
MAIN_BRANCH=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')
MAIN_BRANCH=${MAIN_BRANCH:-$(git remote show origin 2>/dev/null | sed -n 's/.*HEAD branch: //p')}  # network fallback
git diff "${MAIN_BRANCH:-main}"...HEAD   # everything since branching off
```

If `MAIN_BRANCH` comes back empty (no remote, detached HEAD), fall back to the branch the repo actually uses — confirm with `git branch -a` rather than guessing.

`git add -N .` matters because plain `git diff` skips untracked files — without it, a brand-new file's contents never get walked. Drop it if the repo has noisy untracked artifacts you don't want surfaced.

Read the diff before touching any tool. **Diff size vs task size is the first red flag**: a 200-line diff for a 1-line task is usually scope creep — call it out before going further.

## Step 2 — Run the project's automated layer

Find the project's lint / typecheck / test / build commands (usually in `CLAUDE.md`, `README`, or `package.json` scripts). Run them in a sensible order, stop on first hard failure, fix the **root cause** rather than suppressing the rule.

If you're tempted to add an inline ignore (`// eslint-disable`, `// biome-ignore`, `# noqa`, `// @ts-ignore`) — usually the warning is right. Add a suppression only with a written reason in the comment.

## Step 3 — Walk the diff with the surface-area lens

For each changed hunk, check:

### Scope

- [ ] Every changed file traces back to the user's request. If a hunk changed for a reason you can't articulate in one sentence, **revert that hunk**.
- [ ] No drive-by reformat of unrelated code.
- [ ] No commented-out code left behind. No `console.log` / `print` debug statements (unless the file uses them deliberately).
- [ ] No `.only` / `.skip` / `xit` / `debugger` left in tests.
- [ ] No unresolved merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).

### Style

- [ ] Conforms to the project's existing style (the linter handles most; eyeball anyway).
- [ ] No new lint suppressions without a written reason.

### Commits

- [ ] Subject in the project's commit format (Conventional Commits, ticket prefix, whatever the repo uses — `git log` to confirm).
- [ ] Subject is imperative, ≤ ~72 chars, English (unless project explicitly uses another language).
- [ ] AI-attribution follows the project's policy: if the repo requires disclosure (a contributor agreement, license clause, or `CLAUDE.md` rule asking for it), include it; otherwise default to no AI-assistant mentions, model names, or tool `Co-authored-by` trailers.

### Tests

- [ ] If the change is non-trivial logic — is there a test, or a documented manual verification?
- [ ] If the change touches a request flow / RPC handler — did you actually exercise it (curl, browser click, manual run)?
- [ ] If the change is UI — did you actually load the page and use the feature?

## Step 4 — Deep risk scan (depth set by what the change touches)

Step 3 is a shallow surface pass. This step goes deep, but **only where the change earns it** — don't run a full security audit on a copy tweak. Decide depth from what the diff actually touches, then load the matching reference and scan against it:

| If the diff touches… | Load |
|---|---|
| untrusted input, auth/authz, data writes, network calls, file paths, concurrency | `references/security-and-reliability.md` |
| any non-trivial logic (error paths, hot paths, parsing, collections, numerics) | `references/quality-and-boundaries.md` |
| a new abstraction, a module restructure, or a file that grew noticeably | `references/design-smells.md` |

A trivial diff (rename, copy, config value) may need none of these — say so and move on. A change can hit several rows; load each that applies. These references are condensed prompts, not exhaustive audits — they exist to point your attention, not to replace judgment.

## Step 5 — Detect missing co-changes (the high-value step)

This is what automated tools won't catch: in a given codebase, **X always implies Y**. When X changes without Y, prod breaks.

Identify the project's "X-implies-Y" patterns (look in `CLAUDE.md`, recent PRs, or use judgment), then scan the diff for missing pairs. Common shapes across stacks:

- DB schema edited → migration generated / applied?
- New API route added → registered in router / index file?
- New env var read in code → declared in config schema, `.env.example`, deployment vars?
- New user-visible string in i18n project → added to **all** locale files?
- New runtime binding (queue, KV, secret, feature flag) → declared in deployment manifest?
- New dependency added → actually used somewhere, not just installed?
- Public API change → consumers / docs updated?
- New file added → exported from the barrel / index file (if the project uses one)?
- Significant architectural decision → noted in `CLAUDE.md` / ADR / decision log?

For each pattern that applies to this project, check the diff one more time looking specifically for the missing half.

## Step 6 — Decide and report

Tag each finding with a severity, then roll them up into one verdict.

| Severity | Meaning |
|---|---|
| **P0** | Security hole, data-loss risk, or correctness bug — must not ship. |
| **P1** | Logic error, real co-change miss, significant design break — fix before commit. |
| **P2** | Maintainability / smell / minor concern — fix now or file a follow-up. |
| **P3** | Style, naming, optional polish. |

The verdict is the headline; the P-levels are the detail under it:

```
Verdict: green | yellow | red

Green  — nothing above P3; ready to commit. Any P3s are still listed for a batch cleanup, but don't block.
Yellow — passes automated checks, but: <1-2 specific P2 concerns>.
Red    — fix these before commit: <each P0/P1, with file:line and the fix>.
```

Any P0 or P1 → **red**. P2 only → **yellow**. P3-only or clean → **green**. List **every** finding as `[P_] file:line — issue → fix`, P0 first — P3s included, so nothing is silently dropped. Don't inflate a pile of P3s into yellow; severity is about impact, not count.

Then either commit (only if explicitly asked, and verdict is green) or hand it back. Do not auto-commit on yellow.

## Reviewing others (different mode)

If the user is asking you to review **someone else's** branch / PR — not their own work — the priorities flip:

- **Lead with what's correct.** Reviewers who only list problems are exhausting.
- **Rank concerns by severity**: correctness > design > style.
- **Be specific**: file paths and line numbers, not vague "consider refactoring this area".
- **Skip linter-catchable nits**: don't waste review tokens on style the lint config will catch.
- **Don't ask rhetorical "why did you do it this way?"** — either propose a concrete alternative, or accept the choice was deliberate.
- **Distinguish "I disagree" from "this is wrong"**: many style choices are taste. Save the strong words for actual bugs.
- **Run the Step 4 deep scan in full** — on someone else's PR you can't assume their judgment, so load whichever references apply rather than eyeballing.
- **Discipline the false positives.** Before you raise something, ask "would this survive light scrutiny?" Drop it if it is: a pre-existing issue on a line they didn't touch, something a linter/typechecker/CI already catches, or a nitpick a senior engineer wouldn't bother with. A review that is 80% noise gets ignored.

Still emit the same P0–P3 severities and a green/yellow/red verdict — just lead with what's correct and order the narrative correct-first, rather than opening with the verdict.

## Common pitfalls

- **Trusting a green typecheck** — types don't catch missing migrations, missing locale keys, missing deployment bindings, missing router registrations. The Step 5 scan exists for exactly this.
- **Suppressing a lint rule** to silence one warning instead of fixing the underlying issue.
- **Letting a major dependency bump sneak in** via mass `install` / `update` — read the lockfile diff for unexpected jumps.
- **Stamping a commit on top of unrelated staged changes** — `git diff --staged` before commit, every time.
- **Calling done after typecheck** — if the change has user-visible behavior, exercise it before reporting green.

## Composing with project-specific review skills

Project-specific review skills (e.g. one that knows about a particular monorepo's lint setup, dep catalog, i18n locales) should run **on top of** this skill, not duplicate it. Pattern:

1. This skill — generic methodology, stack-agnostic.
2. Project skill — adds the project's specific X-implies-Y patterns and exact commands.

If the project has a review skill, run it after Step 5 of this one.

## Resources

### references/

Condensed scan prompts, loaded on demand by Step 4 — not read up front.

| File | Load when the diff touches… |
|------|------|
| `security-and-reliability.md` | untrusted input, auth, data writes, network, file paths, concurrency |
| `quality-and-boundaries.md` | any non-trivial logic — error handling, performance, boundary conditions |
| `design-smells.md` | a new abstraction, a module restructure, or a file that grew noticeably |
