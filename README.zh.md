# Obsidian Vault Studio

![Obsidian Vault Studio 概览](docs/images/dashboard.png)

把本地 Obsidian 知识库接入 DeepSeek Harness。模型经你授权后可以检索笔记、读取片段、组装上下文，并以“先提案、后写入”的方式创建或追加笔记。索引、向量和统计都留在本机。

[English](README.md)

[![npm version](https://img.shields.io/npm/v/dsh-obsidian-bridge)](https://www.npmjs.com/package/dsh-obsidian-bridge)[![GitHub stars](https://img.shields.io/github/stars/spark-ai-boy/dsh-obsidian-bridge?style=social)](https://github.com/spark-ai-boy/dsh-obsidian-bridge)

## 能做什么

- **本地索引**：解析 Markdown、frontmatter、标签、标题与修改时间，不把整个 Vault 上传到远端。
- **可用的检索**：默认关键词检索，支持英文前缀和输入时自动更新结果；可选 OpenAI 兼容或 Ollama Embedding，启用混合/语义检索。
- **会话访问开关**：默认禁止模型访问 Vault。关闭时所有 `obsidian_*` Agent 工具都会被拒绝，你自己的检索和笔记浏览不受影响。
- **安全写入**：模型只能提出新建或追加提案；你确认后才落盘。每次写入有备份，可撤销；不提供删除、移动、重命名或覆盖工具。
- **数据大盘**：笔记/字数/标签/片段统计、每日热度、活动曲线、Agent 调用次数、最近编辑和标签分布。
- **完全本地**：索引、向量、设置和调用统计都保存在本机。

## 安装

### 要求

- DeepSeek Harness 0.2.x 桌面版，支持安装第三方插件
- 一个本地 Obsidian Vault

### 安装方式

DeepSeek Harness 支持从 GitHub 仓库或 npm 包安装，二选一：

- **GitHub 仓库**：`https://github.com/spark-ai-boy/dsh-obsidian-bridge`
- **npm 包**：`dsh-obsidian-bridge`

### 步骤

1. 在 DeepSeek Harness 左侧栏打开 **插件**。
2. 点击 **添加插件** → **安装第三方插件**。
3. 在输入框中填写上面的 **GitHub 仓库地址** 或 **npm 包名**，然后点击安装；安装完成后点击启用。
4. 在左侧栏打开 **Obsidian 知识库**。

![Obsidian Vault Studio 安装](docs/images/install.png)

## 首次配置

1. 在 **设置** 里选择 Vault 路径，点击 **保存**。
2. 点击 **重建索引**。第一次索引完成后，概览和检索就可以用了。
3. 检索模式默认是 **关键词**，不需要额外配置。
4. 如果要使用语义或混合检索，在设置里填写 OpenAI 兼容或 Ollama 的 Embedding 地址、模型和维度，先点 **测试连接**，保存后再重建索引。
5. 首页右侧的 **允许 Obsidian 内容参与会话** 默认关闭。需要 Agent 使用 Vault 时再打开；关闭后所有 `obsidian_*` 工具调用会被直接拒绝。

![设置页](docs/images/settings.png)

## 使用

### 概览

首页集中展示知识库状态：笔记数量、字数、标签、近 7 天更新、片段数、每日热度、14 天活动曲线、Agent 调用次数和最近编辑。

### 检索

在 **检索** 页输入关键词或前缀，结果会随输入自动更新。可以按文件夹、标签筛选，把需要的片段加入右侧 **上下文**，再复制为带来源的上下文包，或直接让 Agent 通过工具检索。

![检索页](docs/images/search.png)

### 笔记

在 **笔记** 页浏览和阅读笔记。模型写入走提案流程：

1. 模型提出新建或追加内容。
2. 页面展示目标路径和 diff。
3. 你确认后才会写入。
4. 写入后可以撤销，插件会保留备份。

### 在会话中使用

1. 打开首页右侧的 **允许 Obsidian 内容参与会话**。
2. 在 DeepSeek Harness 会话里让模型检索你的笔记，例如：
   - “从我的 Obsidian 里找 RAG 相关的笔记，并给出处。”
   - “把今天的会议记录追加到项目笔记里。”
3. 只有实际检索到或读取的片段会进入会话，不会自动把整个 Vault 塞进 prompt。
4. 不需要时关闭访问开关，后续工具调用会被拒绝。

### Agent 工具

| 工具 | 用途 |
| --- | --- |
| `obsidian_search` | 检索笔记片段，支持模式、文件夹、标签筛选 |
| `obsidian_read_note` | 读取某篇笔记的完整内容 |
| `obsidian_list_notes` | 列出笔记或按条件筛选 |
| `obsidian_stats` | 读取索引、统计和工作区状态 |
| `obsidian_propose_write` | 生成新建/追加提案，不直接写入 |
| `obsidian_apply_write` | 在你确认后应用提案 |
| `obsidian_undo_write` | 撤销指定的已执行写入，支持重启后恢复 |
| `obsidian_index_status` | 查看索引和向量化进度 |

插件不提供删除、移动、重命名或覆盖笔记的工具。

## 隐私与安全

- 索引、向量、设置、调用统计都在本机。插件不包含遥测。**配置非本机 Embedding 服务时，用于向量化的 Markdown 片段会发送到该服务地址**，这可能包含笔记正文；如需正文完全不出本机，请使用回环地址（127.0.0.1 或 localhost）的嵌入服务或关键词检索。
- **允许 Obsidian 内容参与会话**关闭时，所有 `obsidian_*` Agent 工具在执行前被拒绝；Vault Studio 自己的检索和浏览仍然可用。
- 系统提示要求模型在 Obsidian 工具失败时报告错误，不得通过通用文件工具绕过 Vault Studio 或访问开关。
- 访问开关只限制 `obsidian_*` 工具；如果你需要更严格的隔离，请同时检查 DeepSeek Harness 的 workspace/sandbox 权限，避免通用 `read`、`grep`、`bash` 直接访问 Vault 路径。
- 写入操作需要确认，带备份，可撤销；插件不会自动删除或覆盖笔记。

## License

[MIT](LICENSE)
