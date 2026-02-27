# Skills

A collection of reusable **Claude Code Plugins / Skills**.

Each skill is packaged as a standalone plugin with:

- `.claude-plugin/plugin.json` — manifest & metadata
- `skills/<skill-name>/SKILL.md` — system prompt + usage guide
- Optional `assets/` — HTML templates, resources, etc.

## Install

Most convenient way — use the `skills` CLI (open agent skills standard):

```bash
# Install all skills from this repo
npx skills add wuchendi/skills

# Install a specific skill
npx skills add wuchendi/skills --skill explain-words

# List available skills in this repo
npx skills add wuchendi/skills --list
```

> **Note**: If you prefer not to use the `npx skills` tool, you can still load plugins manually:

```bash
# Load directly from local folder (great for development)
claude --plugin-dir ./skills/explain-words
```

After loading, skills appear with **namespace prefix**:

```
/explain-words:explain-words Serendipity
```

## Available Skills

| Skill              | Description                                      | Invocation example                        |
|--------------------|--------------------------------------------------|--------------------------------------------|
| [explain-words](skills/explain-words/) | Explain English words with etymology, examples, usage cards (HTML render support) | `/explain-words:explain-words serendipity` |

## Directory Structure (example)

```
skills/
  explain-words/                  # plugin root
  ├── .claude-plugin/
  │   ├── plugin.json
  │   └── marketplace.json        # optional
  └── skills/
      └── explain-words/
          ├── SKILL.md
          └── assets/
              └── word_card.html
```

## Why plugin-per-skill structure?

- Avoids command/skill name conflicts
- Easier to publish / share individually later
- Compatible with Claude Code plugin marketplace (when you add `.claude-plugin/marketplace.json`)

## Contributing / Adding a Skill

1. Create new folder `skills/<your-plugin-name>/`
2. Add `.claude-plugin/plugin.json` (minimal example below)
3. Add `skills/<skill-name>/SKILL.md` with good frontmatter
4. (Optional) Add `assets/`, `scripts/`, etc.
5. Test locally with `claude --plugin-dir ./skills/<your-plugin-name>`

Minimal `plugin.json` example:

```json
{
  "name": "explain-words",
  "version": "1.0.0",
  "description": "Word explanation skill with nice cards"
}
```

## 📜 License

[MIT](./LICENSE) License © 2025-PRESENT [wudi](https://github.com/WuChenDi)
