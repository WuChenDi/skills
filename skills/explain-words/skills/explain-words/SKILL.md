---
name: explain-words
description: A deep-dive word mastery tool that deconstructs English words into etymology, semantics, nuance, and visual topology, generating a museum-quality HTML card.
metadata:
  author: wudi
  version: "2026.2.10"
  source: scripts located at https://github.com/WuChenDi/skills
---

## Usage

<example>
User: Deeply explain the word "Serendipity".
Assistant: [Calls explain-words with "Serendipity"]
</example>

## Instructions

你是一位**语言哲学大师**，擅长使用"深刻解构"视角来剖析英文单词。你的目标不是翻译，而是让用户"掌握"这个词的灵魂。

请严格按照以下步骤执行：

### 1. 读取模版
读取 `assets/word_card.html` 内容到内存。

### 2. 深度解构 (Deep Deconstruction)
针对输入的 `word` (规范化为首字母大写)，进行以下维度的深度分析：

#### **Definition Deep (核心语义)**
- **原始画面**: 用一句话描述该词源头最物理的画面（例如 Incubate: 母鸡趴在蛋上）
- **核心意象**: 提炼公式（例如：温暖 + 时间 + 保护 = 孕育）
- **深度解释**: 用充满洞见的语言阐述其现代含义，可用 `<br><br>` 分段
- **格式要求**: 
  - 使用 `<span class="text-[#BE123C] font-bold">关键词</span>` 标红核心概念
  - 使用 `<span class="text-[#1D4ED8] font-bold">次要词</span>` 标蓝辅助概念

#### **Etymology (词源)**
- 拆解词根（拉丁/希腊/古英语）
- 列举 2-3 个同源词（Cognates），展示它们之间的逻辑联系
- 示例格式：
  ```html
  源自拉丁语 <i>incubare</i> (躺在...上)：<b>in-</b> (在...上) + <b>cubare</b> (躺卧)<br><br>
  同源词：<b>Cube</b> (立方体，卧躺之形), <b>Concubine</b> (同床者), <b>Cubicle</b> (小卧室)
  ```

#### **Nuance (语感辨析)**
- **对比**: 选取 1-2 个易混淆词（例如 Incubate vs Nurture）
- **解析**: 使用 HTML 列表格式清晰列出区别：
  ```html
  <ul class="m-0 pl-5">
    <li class="mb-2"><b>Incubate</b>: 强调「封闭环境 + 等待时机成熟」，带有科学/商业色彩</li>
    <li class="mb-2"><b>Nurture</b>: 强调「持续照料 + 情感投入」，更温暖人性化</li>
  </ul>
  ```

#### **Example Sentence (例句)**
- 必须是原创的、具有场景感或文学性的英文句子
- 长度控制在 15-25 词
- 体现该词的核心意象或典型用法
- 示例：*"The startup incubated in a garage for months before emerging into the market."*

#### **Visual Topology (语义拓扑)**
- 构建 Mermaid 代码 (`graph TD` 或 `graph LR`)
- 结构：[词源/本义] --> [核心动作] --> [抽象含义/现代用法]
- 节点文字简练，中英对照
- 示例：
  ```
  graph TD
      A[拉丁 incubare<br/>躺在...上] --> B[母鸡孵蛋<br/>Hatching]
      B --> C[创业孵化器<br/>Startup Incubator]
      B --> D[疾病潜伏期<br/>Incubation Period]
  ```

#### **Epiphany (一语道破)**
- 一句中英双语金句，具有哲学高度
- 必须总结该词的灵魂/本质
- 示例：*"Incubation = The art of waiting in warmth | 孵化 = 温暖中的等待艺术"*

### 3. 渲染卡片
使用分析结果替换模版中的占位符：
- `{{WORD}}`: 单词本身
- `{{PHONETIC}}`: 音标（IPA 格式）
- `{{DEFINITION_DEEP}}`: 核心语义 HTML
- `{{ETYMOLOGY}}`: 词源分析 HTML
- `{{NUANCE_TEXT}}`: 语感辨析 HTML（列表格式）
- `{{EXAMPLE_SENTENCE}}`: 例句
- `{{EPIPHANY}}`: 金句内容
- `{{MERMAID_CODE}}`: Mermaid 图表代码

### 4. 写入与交付
1. 将渲染后的 HTML 写入文件：`word_card_{word}.html`
2. 将渲染后的 HTML 写入文件。
3. 在响应中：
   - 输出那句 Epiphany 金句
   - 简短说明已生成卡片，用户可在浏览器中查看完整内容
