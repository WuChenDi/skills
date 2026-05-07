---
name: pre-pr-review
description: Pre-commit / pre-PR self-review of your own changes. Trigger when the user asks to "review my changes", "self-review", "sanity-check this branch", "look at the diff before I commit", "before I push", or otherwise wants a check on the branch they're about to ship. Pulls the diff, walks a surface-area checklist, scans for missing co-changes (X-implies-Y), and renders a green/yellow/red verdict. Skip when reviewing **someone else's** PR (different mode — see §Reviewing others) or when the user has already committed and wants a post-hoc audit.
metadata:
  author: wudi
  version: "2026.05.07"
  source: https://github.com/WuChenDi/skills
---

# pre-pr-review

Disciplined self-review before commit / before PR. The goal is to catch what automated tools won't, and to run the things they will.

This skill is **stack-agnostic**. It will not tell you which lint / typecheck / test commands to run — that depends on the project. Use the project's `CLAUDE.md` (or equivalent) for the exact commands; this skill provides the *thinking framework*.

## Step 1 — Pull the diff

```bash
git status
git diff                         # working tree
git diff --staged                # staged
git diff <main-branch>...HEAD    # everything since branching off (replace <main-branch> with main / master / develop / etc.)
```

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

### Style

- [ ] Conforms to the project's existing style (the linter handles most; eyeball anyway).
- [ ] No new lint suppressions without a written reason.

### Commits

- [ ] Subject in the project's commit format (Conventional Commits, ticket prefix, whatever the repo uses — `git log` to confirm).
- [ ] Subject is imperative, ≤ ~72 chars, English (unless project explicitly uses another language).
- [ ] No mention of AI assistants, model names, or `Co-authored-by` trailers for tools.

### Tests

- [ ] If the change is non-trivial logic — is there a test, or a documented manual verification?
- [ ] If the change touches a request flow / RPC handler — did you actually exercise it (curl, browser click, manual run)?
- [ ] If the change is UI — did you actually load the page and use the feature?

## Step 4 — Detect missing co-changes (the high-value step)

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

## Step 5 — Decide and report

Compact verdict to the user:

```
Verdict: green | yellow | red

Green  — passes all checks, ready to commit.
Yellow — passes automated checks, but: <1-2 specific concerns>.
Red    — fix these before commit: <specific failures>.
```

Then either commit (only if explicitly asked, and verdict ≥ green) or hand it back. Do not auto-commit on yellow.

## Reviewing others (different mode)

If the user is asking you to review **someone else's** branch / PR — not their own work — the priorities flip:

- **Lead with what's correct.** Reviewers who only list problems are exhausting.
- **Rank concerns by severity**: correctness > design > style.
- **Be specific**: file paths and line numbers, not vague "consider refactoring this area".
- **Skip linter-catchable nits**: don't waste review tokens on style the lint config will catch.
- **Don't ask rhetorical "why did you do it this way?"** — either propose a concrete alternative, or accept the choice was deliberate.
- **Distinguish "I disagree" from "this is wrong"**: many style choices are taste. Save the strong words for actual bugs.

## Common pitfalls

- **Trusting a green typecheck** — types don't catch missing migrations, missing locale keys, missing deployment bindings, missing router registrations. The Step 4 scan exists for exactly this.
- **Suppressing a lint rule** to silence one warning instead of fixing the underlying issue.
- **Letting a major dependency bump sneak in** via mass `install` / `update` — read the lockfile diff for unexpected jumps.
- **Stamping a commit on top of unrelated staged changes** — `git diff --staged` before commit, every time.
- **Calling done after typecheck** — if the change has user-visible behavior, exercise it before reporting green.

## Composing with project-specific review skills

Project-specific review skills (e.g. one that knows about a particular monorepo's lint setup, dep catalog, i18n locales) should run **on top of** this skill, not duplicate it. Pattern:

1. This skill — generic methodology, stack-agnostic.
2. Project skill — adds the project's specific X-implies-Y patterns and exact commands.

If the project has a review skill, run it after Step 3 of this one.
