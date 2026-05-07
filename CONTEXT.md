# CONTEXT.md

Shared vocabulary used in this repo. When a term has a precise meaning here, use it instead of paraphrasing — and reach for these words first when writing skill descriptions, commit messages, or talking with the agent.

## Core terms

- **plugin** — a folder under `skills/<category>/<name>/` that has a `.claude-plugin/plugin.json`. The unit Claude Code loads.
- **skill** — a single `SKILL.md` plus its assets, living inside a plugin at `skills/<skill-name>/`. The unit the user invokes.
- **plugin == skill (in this repo)** — by convention every plugin here ships exactly one skill with the same name, so "skill" and "plugin" are used interchangeably. The two-level `skills/.../skills/...` nesting is a Claude Code structural requirement, not extra abstraction.
- **registry** — the `skills` array in the root `.claude-plugin/plugin.json`. Every plugin path must be listed here to be discoverable via `npx skills`.
- **namespace prefix** — when invoked, a skill appears as `/<plugin>:<skill>`. Because plugin name == skill name in this repo, both halves are identical (e.g. `/explain-words:explain-words`).

## Categories

- **engineering** — generic code-work methodology, reusable across any codebase.
- **productivity** — generic engineer workflow tools, not tied to writing code.
- **misc** — project-specific or single-purpose. Lives or dies with one repo.
- **fun** — kept for play; not engineering work.

## Trigger contract

The `description` field in a skill's `SKILL.md` frontmatter is its **trigger contract** with the agent. The agent decides whether to fire the skill almost entirely from this string, so it must:

- Name the situations the skill applies to in the user's actual phrasing.
- Name what the skill is **not** for, when the boundary is non-obvious.
- Not exceed what the skill body actually delivers.

A vague description is the most common reason a skill silently never runs.

## Install paths (mental model)

- **Repo source**: `skills/<category>/<plugin>/` — what lives in git.
- **Local link target**: `~/.claude/skills/<plugin>/` — created by `scripts/link-skills.sh`, flat (category is dropped). The link script is idempotent and refuses to run if `~/.claude/skills` is a symlink back into the repo.
- **End-user install**: `npx skills add wuchendi/skills` — reads the registry and pulls plugins by their listed paths.
