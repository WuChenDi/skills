# CLAUDE.md

Working notes for Claude when editing this repo. Read alongside `CONTEXT.md` for the shared vocabulary.

## What this repo is

A personal collection of **Claude Code plugins**, each shipping one or more **skills**. The repo is the source for `npx skills add wuchendi/skills`; it is not a runtime — code here is loaded by other Claude installations.

## Layout rules

```
skills/<category>/<plugin>/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json   # optional
└── skills/<skill>/
    ├── SKILL.md
    └── assets/ | references/   # optional
```

- One plugin per folder. One skill per plugin is the norm; multi-skill plugins are allowed but rare.
- Plugin folder name == plugin name == skill name (so the namespace prefix matches: `/<plugin>:<skill>`).
- `<category>` is one of `engineering/`, `productivity/`, `misc/`, `fun/`. Pick the most honest fit; do not invent a new category for a single skill.

## Categories — when to use which

- **engineering** — generic code-work methodology (TDD loops, debugging loops, architecture review). Reusable across any codebase.
- **productivity** — generic engineer workflow tools that aren't code-specific (output compression, interview-style requirement gathering).
- **misc** — project-specific or single-purpose tools. Anchored to one repo or one narrow scenario. `cdlab-projects` lives here because it only makes sense inside the cdlab `projects` monorepo.
- **fun** — non-engineering tools kept for play. `explain-words` lives here.

## Adding or editing a skill

1. Place the plugin under the right `<category>/`.
2. Register its path in `.claude-plugin/plugin.json` at the repo root.
3. The `SKILL.md` frontmatter `description` is the trigger contract — it must describe **when to fire** in concrete phrases the user is likely to say. Vague descriptions are the #1 reason a skill never gets used.
4. Keep `metadata.author`, `metadata.version`, `metadata.source` filled in.

## Verifying changes

- `bash scripts/list-skills.sh` — should list every `SKILL.md`. If a skill is missing, the path or filename is wrong.
- `bash scripts/link-skills.sh` — symlinks every skill into `~/.claude/skills/` for local testing. Refuses to run if `~/.claude/skills` is itself a symlink back into this repo.

## Style

- **English only** for everything that ships: `SKILL.md`, `references/*.md`, plugin metadata, commit messages, PR text. Trigger phrases inside a `description` may include Chinese only when the skill is explicitly project-specific and the project's users speak Chinese (e.g. `cdlab-projects`).
- No emojis in skill content unless the skill is generating user-facing output (e.g. `explain-words` cards).
- No mentions of AI tooling vendors (Claude / Anthropic / OpenAI / etc.) in commit messages or PR text.

## What not to add

- Tutorials, philosophy essays, or marketing copy in the root README. Keep it to: install, reference list, license.
- Per-skill READMEs that duplicate `SKILL.md`. The plugin's own README is fine if it adds installation context the SKILL doesn't cover.
- New top-level docs (`ARCHITECTURE.md`, `ROADMAP.md`, etc.) without an explicit reason. This repo is small; a sprawling doc tree hides the actual content.
