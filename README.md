# Obsidian Vault Studio

![Obsidian Vault Studio dashboard](docs/images/dashboard.png)

Connect a local Obsidian vault to DeepSeek Harness. After you grant access, the model can search your notes, read relevant passages, build grounded context, and create or append notes through a proposal-first workflow. The index, embeddings, and statistics stay on your machine.

[中文](README.zh.md)

[![npm version](https://img.shields.io/npm/v/dsh-obsidian-bridge)](https://www.npmjs.com/package/dsh-obsidian-bridge)[![GitHub stars](https://img.shields.io/github/stars/spark-ai-boy/dsh-obsidian-bridge?style=social)](https://github.com/spark-ai-boy/dsh-obsidian-bridge)

## What it does

- **Local index** — parses Markdown, frontmatter, tags, headings, and modification times without uploading the whole vault.
- **Practical retrieval** — keyword search by default, with English prefix matching and live results; optional OpenAI-compatible or Ollama embeddings enable hybrid and semantic modes.
- **Conversation access switch** — model access is off by default. When off, every `obsidian_*` Agent tool is denied; your own search and note browsing keep working.
- **Safe writes** — the model can only propose a create or append. Nothing is written until you approve; writes are backed up and can be undone. There are no delete, move, rename, or overwrite tools.
- **Dashboard** — note, word, tag, and chunk counts; a daily heatmap; a 14-day activity curve; Agent call counters; recent notes and tag distribution.
- **Local by design** — index, vectors, settings, and usage counters all stay on your machine.

## Install

### Requirements

- DeepSeek Harness 0.2.x desktop, with third-party plugin installation enabled
- A local Obsidian vault

### Install source

DeepSeek Harness can install the plugin from either a GitHub repository or an npm package:

- **GitHub repository**: `https://github.com/spark-ai-boy/dsh-obsidian-bridge`
- **npm package**: `dsh-obsidian-bridge`

### Steps

1. Open **Plugins** in the DeepSeek Harness sidebar.
2. Choose **Add plugin** → **Install third-party plugin**.
3. Enter either the **GitHub repository URL** or the **npm package name** above, install it, then click **Enable**.
4. Open **Obsidian Vault Studio** in the sidebar.

![Obsidian Vault Studio installation](docs/images/install.png)

## First run

1. Open **Settings**, choose your vault path, and click **Save**.
2. Click **Rebuild index**. The dashboard and search become available once the first index completes.
3. Retrieval mode defaults to **Keyword**; no extra setup is needed.
4. For semantic or hybrid search, enter an OpenAI-compatible or Ollama embedding endpoint, model, and dimensions in Settings. Click **Test connection**, save, then rebuild the index.
5. The **Allow vault context in conversations** switch on the dashboard is off by default. Turn it on when you want the Agent to use the vault; when off, every `obsidian_*` tool call is denied.

![Settings](docs/images/settings.png)

## Usage

### Dashboard

The home page shows note, word, tag, 7-day update, and chunk counts; a 365-day heatmap; a 14-day activity curve; Agent call counters; recent notes; and tag distribution.

### Search

Type a keyword or prefix on the **Search** page; results update as you type. Filter by folder or tag, add passages to the **Context** tray, then copy a source-attributed context packet or let the Agent search through tools.

![Search](docs/images/search.png)

### Notes

Browse and read notes on the **Notes** page. Model writes follow a proposal flow:

1. The model proposes new or appended content.
2. The page shows the target path and a diff.
3. Nothing is written until you approve.
4. Writes can be undone and are backed up.

### Use in a conversation

1. Turn on **Allow vault context in conversations** on the dashboard.
2. Ask the model to search your notes, for example:
   - "Find my notes about RAG and cite the sources."
   - "Append today's meeting notes to the project note."
3. Only passages actually retrieved or read enter the conversation; the whole vault is never injected automatically.
4. Turn the access switch off when you no longer need it. Later tool calls will be denied.

### Agent tools

| Tool | Purpose |
| --- | --- |
| `obsidian_search` | Search note passages by mode, folder, or tag |
| `obsidian_read_note` | Read a full note |
| `obsidian_list_notes` | List or filter notes |
| `obsidian_stats` | Read index, statistics, and workspace status |
| `obsidian_propose_write` | Create a create/append proposal without writing |
| `obsidian_apply_write` | Apply a proposal after your approval |
| `obsidian_undo_write` | Undo an applied write, including after a restart |
| `obsidian_index_status` | Check indexing and embedding progress |

The plugin has no delete, move, rename, or overwrite tools.

## Privacy and safety

- The index, vectors, settings, and usage counters are local. The plugin contains no telemetry. **When you configure a remote embedding service, Markdown chunks are sent to that service for vectorization**, including its URL host outside your machine; use a loopback endpoint to keep embeddings local.
- When **Allow vault context in conversations** is off, every `obsidian_*` Agent tool is denied before execution. Vault Studio's own search and browsing remain available.
- The system prompt tells the model to report Obsidian tool failures and never bypass Vault Studio or the access switch through generic file tools.
- The access switch only gates `obsidian_*` tools. For a hard boundary, also check DeepSeek Harness workspace/sandbox permissions so generic `read`, `grep`, and `bash` cannot reach the vault path.
- Writes require approval, keep backups, and can be undone. The plugin never deletes or overwrites notes automatically.

## License

[MIT](LICENSE)
