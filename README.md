# skills

本仓库用于存放一组可复用的 **Claude Code 插件（Plugins）/技能（Skills）**。每个技能以“插件”的形式独立打包，包含：

- `.claude-plugin/plugin.json`：插件清单（元数据、可选的路径配置）
- `skills/<skill-name>/SKILL.md`：技能的系统提示词与使用说明（Claude 会按此执行）
- `assets/` 等资源：供技能读取/渲染（例如 HTML 模板）

## 目录结构

当前仓库结构（示例）：

```text
skills/
  skills/
    explain-words/                # 一个插件（plugin root）
      .claude-plugin/
        plugin.json               # 插件 manifest
        marketplace.json          # 可选：本地/自建 marketplace 目录（用于安装）
      skills/
        explain-words/
          SKILL.md                # 技能说明与指令
          assets/
            word_card.html        # 技能使用的 HTML 模板
```

## 快速开始（本地加载插件）

开发/自用最简单的方式是用 `--plugin-dir` 直接加载插件目录（无需安装到 marketplace）：

```bash
claude --plugin-dir ./skills/explain-words
```

启动后，该插件下的技能会以 **命名空间** 形式出现（格式为 `/插件名:技能名`）。

例如 `explain-words` 插件里的 `explain-words` 技能，调用形如：

```text
/explain-words:explain-words Serendipity
```

> 说明：Claude Code 的插件技能为避免冲突，默认都会被命名空间前缀化（详见官方插件文档）。

<!-- ## 贡献/新增一个技能

建议每个技能都单独建一个插件目录，沿用仓库现有布局：

1. 新建 `skills/<your-plugin>/`
2. 添加 `.claude-plugin/plugin.json`
3. 添加 `skills/<your-skill>/SKILL.md`（可搭配 `assets/`、`scripts/` 等）
4. 在 `SKILL.md` 的 frontmatter 中维护 `name/description/metadata.version` -->

## 📜 License

[MIT](./LICENSE) License © 2025-PRESENT [wudi](https://github.com/WuChenDi)
