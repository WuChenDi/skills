# explain-words

`explain-words` 是一个面向 **Claude Code** 的英文单词深度解构技能：从词源、核心语义、语感辨析到语义拓扑图（Mermaid），并生成一张“博物馆级”的 HTML 单词卡片。

该插件内置了一个 HTML 模板：`assets/word_card.html`，技能会把分析结果渲染进模板并写入本地文件。

## 你能得到什么

- **Definition Deep（核心语义）**：原始画面 + 核心意象公式 + 现代含义的洞见式阐释
- **Etymology（词源）**：词根拆解 + 同源词（cognates）联想网络
- **Nuance（语感）**：与易混词对比的差异清单（场景/色彩/力度）
- **Example Sentence（例句）**：原创、具场景感的英文句子
- **Visual Topology（语义拓扑）**：Mermaid 图从本义走到现代用法
- **Epiphany（一语道破）**：中英双语金句总结词的“灵魂”

## 使用方式一：作为 Claude Code 插件（推荐）

在本仓库根目录执行：

```bash
claude --plugin-dir ./skills/explain-words
```

然后在 Claude Code 中调用（插件技能会被命名空间前缀化）：

```text
/explain-words:explain-words Serendipity
```

## 使用方式二：作为项目内“非命名空间”单技能（兼容习惯）

如果你更希望直接使用短命令 `/explain-words <word>`（不带 `插件名:` 前缀），可以把技能目录复制到当前项目的 `.claude/skills/` 下：

```text
.claude/
  skills/
    explain-words/
      SKILL.md
      assets/
        word_card.html
```

把本插件中的 `skills/explain-words/skills/explain-words/` 整个目录复制为 `.claude/skills/explain-words/` 后，通常即可用：

```text
/explain-words Serendipity
```

> 说明：这种方式属于 Claude Code 的“Standalone（.claude/）”配置模式；插件模式更适合分发与复用。

## 生成的文件（HTML 卡片）

技能会将渲染后的 HTML 写入：

```text
word_card_{Word}.html
```

例如输入 `Serendipity`，会生成 `word_card_Serendipity.html`。用浏览器直接打开即可查看完整卡片（模板中使用 Tailwind CDN 与 Mermaid 渲染）。

### 模板占位符

模板 `assets/word_card.html` 中的关键占位符包括：

- `{{WORD}}`
- `{{PHONETIC}}`
- `{{DEFINITION_DEEP}}`
- `{{ETYMOLOGY}}`
- `{{NUANCE_TEXT}}`
- `{{EXAMPLE_SENTENCE}}`
- `{{EPIPHANY}}`
- `{{MERMAID_CODE}}`

## 自定义与开发

- **改样式/布局**：编辑 `skills/explain-words/skills/explain-words/assets/word_card.html`
- **改输出结构**：编辑 `skills/explain-words/skills/explain-words/SKILL.md`
- **版本信息**：
  - `SKILL.md` 的 `metadata.version`（当前为 `2026.2.10`）
  - `.claude-plugin/plugin.json`（可选：建议补充 `version/license/repository` 等字段以便分发）

## 注意事项

- **外部依赖**：HTML 模板通过 CDN 引入 Tailwind 与 Mermaid。离线环境打开页面可能无法正常渲染。
- **Mermaid 安全级别**：模板里 `securityLevel: 'loose'` 以提升渲染兼容性；若你在更严格环境使用，可自行调整。
