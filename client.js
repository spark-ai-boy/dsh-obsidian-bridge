window.__ModuleLoader__.load({
  id: "dsh-obsidian-bridge",
  factory(require) {
    const React = require("react");
    const h = React.createElement;
    const { useEffect, useMemo, useRef, useState } = React;

    const NS = "obsidian-vault-studio";
    const PANEL_ID = "obsidian-vault-studio";
    const NAMESPACE = "obsidianVault";
    const REPO_URL = "https://github.com/spark-ai-boy/dsh-obsidian-bridge";

    const DICT = {
      en: {
        "panel": "Obsidian Vault",
        "title": "Obsidian Vault Studio",
        "subtitle": "Local knowledge, grounded answers, safe writes.",
        "tab.dashboard": "Dashboard",
        "tab.search": "Search",
        "tab.notes": "Notes",
        "tab.settings": "Settings",
        "action.refresh": "Refresh",
        "action.reindex": "Reindex",
        "action.save": "Save",
        "action.cancel": "Cancel",
        "action.apply": "Write to vault",
        "action.copy": "Copy context",
        "action.test": "Test connection",
        "action.newNote": "New note",
        "action.append": "Append",
        "status.ready": "Index ready",
        "status.indexing": "Indexing {{progress}}%",
        "status.embedding": "Embedding {{progress}}%",
        "status.notConfigured": "Vault not configured",
        "stats.notes": "Notes",
        "stats.words": "Words",
        "stats.tags": "Tags",
        "stats.links": "Links",
        "stats.week": "Last 7 days",
        "stats.weekFoot": "notes updated",
        "stats.chunks": "Chunks",
        "dashboard.activity": "Activity · 14 days",
        "dashboard.heroTitle": "Turn your vault into context",
        "dashboard.heroBody": "Ask a question, trace it back to the notes that support it, and bring only the useful fragments into the conversation.",
        "dashboard.heroPlaceholder": "Ask your vault, or search for a note…",
        "dashboard.try": "Try",
        "dashboard.graph": "Tag constellation",
        "dashboard.graphSub": "The ideas your notes return to most often.",
        "dashboard.recentSub": "The latest edits in this vault.",
        "dashboard.noTags": "No tags yet",
        "dashboard.avg": "avg / note",
        "dashboard.edits": "edits",
        "dashboard.peakLabel": "peak",
        "dashboard.references": "references",
        "dashboard.notesWords": "{{notes}} notes · {{words}} words",
        "access.title": "Allow vault context in conversations",
        "access.onBody": "Agents may call obsidian_* tools and send retrieved notes into this conversation.",
        "access.offBody": "Agents cannot retrieve or write this vault. Your Vault Studio search and notes still work.",
        "access.on": "Allowed",
        "access.off": "Blocked",
        "access.settingHint": "When off, every obsidian_* Agent tool is denied.",
        "access.enabled": "Vault context is now available to the Agent.",
        "access.disabled": "Vault context is blocked for the Agent.",
        "access.shortOn": "Agent access: on",
        "access.shortOff": "Agent access: off",
        "quick.title": "Quick controls",
        "quick.mode": "Retrieval mode",
        "quick.modeHint": "Switch without leaving the dashboard",
        "quick.watch": "Watch files",
        "quick.watchHint": "Rebuild after file changes",
        "quick.settings": "Open full settings",
        "heatmap.title": "Daily heatmap",
        "heatmap.sub": "Edits across the last 365 days.",
        "heatmap.badge": "{{count}} active days",
        "heatmap.less": "Less",
        "heatmap.more": "More",
        "heatmap.empty": "No activity yet",
        "heatmap.activeDays": "active days",
        "heatmap.edits": "edits",
        "heatmap.currentStreak": "current streak",
        "heatmap.longestStreak": "longest streak",
        "core.title": "Core notes",
        "core.sub": "The notes this vault links back to most.",
        "core.notes": "notes",
        "core.backlinks": "{{count}} backlinks",
        "core.links": "{{count}} links",
        "core.empty": "No note has backlinks yet.",
        "composition.title": "Vault composition",
        "composition.sub": "Organization, depth, and recent activity.",
        "composition.coverage": "Tag coverage",
        "composition.tagged": "{{tagged}} / {{total}} notes",
        "composition.untagged": "Untagged",
        "composition.longNotes": "Long-form notes",
        "composition.longHint": "≥ 2,000 words",
        "composition.recent30": "Updated in 30 days",
        "usage.title": "Agent usage",
        "usage.sub": "Successful Obsidian tool calls by the model.",
        "usage.calls": "calls",
        "usage.total": "total calls",
        "usage.today": "today",
        "usage.month": "this month",
        "usage.last30": "last 30 days",
        "usage.daily": "Daily",
        "usage.monthly": "Monthly",
        "usage.empty": "No Agent calls yet.",
        "usage.days14": "14d",
        "usage.months6": "6m",
        "quick.kicker": "QUICK CONTROLS",
        "dashboard.kicker": "LOCAL VAULT / INDEXED ON DEVICE",
        "dashboard.vaultLabel": "VAULT",
        "search.kicker": "RETRIEVAL / LOCAL INDEX",
        "search.vector": "vector",
        "notes.kicker": "VAULT OPERATIONS / SAFE WRITES",
        "header.kicker": "DEEPSEEK HARNESS / LOCAL KNOWLEDGE",
        "settings.modeHint": "keyword · semantic · hybrid",
        "settings.watchHint": "fs.watch · debounced",
        "hint.keywordInline": "Keyword mode · configure semantic search",
        "hint.keywordTitle": "Keyword mode is active",
        "hint.keywordBody": "Embeddings are not configured yet, so search uses local keyword matching. Add an embedding model in Settings, then switch Index mode to Hybrid or Semantic.",
        "hint.configure": "Configure semantic search",
        "dashboard.health": "Vault health",
        "dashboard.recent": "Recently edited",
        "dashboard.folders": "Folders",
        "dashboard.tags": "Top tags",
        "dashboard.empty": "Index the vault to see your dashboard.",
        "search.placeholder": "Type a keyword or prefix; results update as you type…",
        "search.button": "Search",
        "search.hybrid": "Hybrid",
        "search.semantic": "Semantic",
        "search.keyword": "Keyword",
        "search.empty": "Search your vault to retrieve grounded context.",
        "search.noResults": "No matching notes.",
        "search.resultMeta": "{{mode}} · {{count}} results",
        "search.add": "Add to context",
        "search.added": "In context",
        "search.snippet": "snippet",
        "search.folder": "Folder",
        "search.tag": "Tag",
        "search.all": "All",
        "context.title": "Context",
        "context.empty": "Select search results to build a context packet.",
        "context.token": "~{{count}} tokens",
        "context.copyDone": "Context copied to clipboard.",
        "context.copied": "Copied",
        "notes.filter": "Filter notes…",
        "notes.empty": "No notes indexed.",
        "notes.select": "Select a note to read it.",
        "notes.frontmatter": "Frontmatter",
        "notes.links": "Links",
        "notes.words": "words",
        "notes.updated": "Updated",
        "settings.vault": "Vault",
        "settings.vaultPath": "Vault path",
        "settings.vaultHint": "Absolute path to the local Obsidian vault.",
        "settings.index": "Index",
        "settings.indexMode": "Index mode",
        "settings.embedding": "Embedding service",
        "settings.embeddingUrl": "Service URL",
        "settings.embeddingModel": "Model",
        "settings.embeddingKey": "API key",
        "settings.embeddingKeyHint": "Optional; stored locally in the plugin data directory.",
        "settings.dimensions": "Dimensions",
        "settings.watch": "Watch for file changes",
        "settings.autoWrite": "Allow automatic writes (not recommended)",
        "settings.autoWriteHint": "When off, every write requires confirmation.",
        "settings.privacy": "Index, vectors, and settings stay local. A remote embedding service receives Markdown chunks for vectorization; use a loopback endpoint to keep note text on this machine.",
        "settings.testOk": "Embedding connected · {{dims}} dimensions",
        "settings.saved": "Settings saved.",
        "settings.embeddingFailed": "Embedding test failed: {{error}}",
        "settings.reindexStarted": "Reindex started.",
        "setup.title": "Connect your Obsidian vault",
        "setup.body": "Point Vault Studio at a local vault. Keyword indexing stays on this machine. Embedding can be configured separately later.",
        "setup.path": "Vault path",
        "setup.button": "Connect vault",
        "write.title": "Proposed write",
        "write.create": "Create note",
        "write.append": "Append to note",
        "write.path": "Target path",
        "write.content": "Markdown content",
        "write.reason": "Why this note",
        "write.preview": "Review the change before writing",
        "write.saved": "Saved to {{path}}",
        "write.undo": "Undo",
        "write.undone": "Write undone.",
        "error.prefix": "Something went wrong: ",
        "error.noRemote": "Vault host service is not available.",
        "error.clipboard": "Clipboard is unavailable in this context.",
        "loading": "Loading…",
        "never": "Never",
        "dashboard.healthSub": "orphans · broken links · stale notes",
        "dashboard.peak": "Peak {{max}} edits · {{mode}} index",
        "health.label": "HEALTH",
        "health.orphans": "Orphans",
        "health.broken": "Broken links",
        "health.stale": "Stale notes",
        "health.embedding": "Embedding",
        "health.ready": "ready",
        "notes.lead": "Read, append, and create Markdown notes. Deleting and overwriting are intentionally unavailable.",
        "settings.embeddingHint": "OpenAI-compatible or Ollama embedding endpoint",
        "settings.dimensionsHint": "Must match the model output",
        "settings.optional": "optional",
        "settings.embeddingKeySaved": "Saved securely. Leave blank to keep the current key; enter a new key to replace it.",
        "settings.embeddingKeyEmpty": "Optional. Leave blank for no API key.",
        "layout.main": "Vault Studio",
        "search.resultsCount": "{{count}} results",
        "index.title": "Index status",
        "index.building": "Building",
        "index.embedding": "Embedding",
        "index.chunks": "Chunks",
        "index.vectors": "Vectors",
        "index.idle": "idle",
        "index.ready": "ready",
        "github.kicker": "OPEN SOURCE · BUILT IN PUBLIC",
        "github.title": "Follow Obsidian Vault Studio on GitHub",
        "github.body": "New features and fixes land in the repository first. Star the project to keep up, and open an issue to shape what comes next.",
        "github.cta": "Star on GitHub",
        "github.aria": "Open the dsh-obsidian-bridge repository on GitHub",
        "github.repo": "spark-ai-boy / dsh-obsidian-bridge"
      },
      zh: {
        "panel": "Obsidian 知识库",
        "title": "Obsidian Vault Studio",
        "subtitle": "本地知识库，引用可追溯，写入有确认。",
        "tab.dashboard": "概览",
        "tab.search": "检索",
        "tab.notes": "笔记",
        "tab.settings": "设置",
        "action.refresh": "刷新",
        "action.reindex": "重建索引",
        "action.save": "保存",
        "action.cancel": "取消",
        "action.apply": "写入知识库",
        "action.copy": "复制上下文",
        "action.test": "测试连接",
        "action.newNote": "新建笔记",
        "action.append": "追加",
        "status.ready": "索引就绪",
        "status.indexing": "索引中 {{progress}}%",
        "status.embedding": "向量化 {{progress}}%",
        "status.notConfigured": "未配置知识库",
        "stats.notes": "笔记",
        "stats.words": "字数",
        "stats.tags": "标签",
        "stats.links": "双链",
        "stats.week": "近 7 天",
        "stats.weekFoot": "篇笔记更新",
        "stats.chunks": "片段",
        "dashboard.activity": "活动 · 最近 14 天",
        "dashboard.heroTitle": "把你的知识库变成上下文",
        "dashboard.heroBody": "从一个问题开始，找到真正支撑答案的笔记，只把有用的片段带进对话。",
        "dashboard.heroPlaceholder": "向知识库提问，或搜索一篇笔记…",
        "dashboard.try": "试试",
        "dashboard.graph": "标签星图",
        "dashboard.graphSub": "你的笔记最常回到哪些想法。",
        "dashboard.recentSub": "这个知识库最近发生的编辑。",
        "dashboard.noTags": "还没有标签",
        "dashboard.avg": "平均 / 篇",
        "dashboard.edits": "次编辑",
        "dashboard.peakLabel": "峰值",
        "dashboard.references": "次引用",
        "dashboard.notesWords": "{{notes}} 篇笔记 · {{words}} 字",
        "access.title": "允许 Obsidian 内容参与会话",
        "access.onBody": "Agent 可以调用 obsidian_* 工具，并把检索到的笔记片段带入当前会话。",
        "access.offBody": "Agent 不能检索或写入这个知识库。你自己的 Vault Studio 检索和笔记操作不受影响。",
        "access.on": "允许",
        "access.off": "已关闭",
        "access.settingHint": "关闭时，所有 obsidian_* Agent 工具都会被拒绝。",
        "access.enabled": "已允许 Agent 使用知识库上下文。",
        "access.disabled": "已禁止 Agent 访问知识库上下文。",
        "access.shortOn": "Agent 访问：允许",
        "access.shortOff": "Agent 访问：已关闭",
        "quick.title": "快捷控制",
        "quick.mode": "检索模式",
        "quick.modeHint": "不用离开首页即可切换",
        "quick.watch": "监听文件",
        "quick.watchHint": "文件变化时重建索引",
        "quick.settings": "打开完整设置",
        "heatmap.title": "每日热度",
        "heatmap.sub": "过去 365 天的笔记编辑分布。",
        "heatmap.badge": "{{count}} 个活跃日",
        "heatmap.less": "少",
        "heatmap.more": "多",
        "heatmap.empty": "还没有编辑记录",
        "heatmap.activeDays": "活跃天数",
        "heatmap.edits": "次编辑",
        "heatmap.currentStreak": "当前连续",
        "heatmap.longestStreak": "最长连续",
        "core.title": "核心笔记",
        "core.sub": "知识库中被反向链接最多、最值得先读的笔记。",
        "core.notes": "篇",
        "core.backlinks": "{{count}} 个反向链接",
        "core.links": "{{count}} 个出链",
        "core.empty": "还没有被反向链接的笔记。",
        "composition.title": "知识库构成",
        "composition.sub": "标签组织度、内容深度与近期更新。",
        "composition.coverage": "标签覆盖",
        "composition.tagged": "{{tagged}} / {{total}} 篇",
        "composition.untagged": "未打标签",
        "composition.longNotes": "长文笔记",
        "composition.longHint": "≥ 2000 字",
        "composition.recent30": "近 30 天更新",
        "usage.title": "Agent 调用",
        "usage.sub": "大模型成功调用 Obsidian 工具的本地统计。",
        "usage.calls": "次",
        "usage.total": "总调用",
        "usage.today": "今天",
        "usage.month": "本月",
        "usage.last30": "近 30 天",
        "usage.daily": "每日",
        "usage.monthly": "每月",
        "usage.empty": "大模型还没有调用过 Obsidian 工具。",
        "usage.days14": "14天",
        "usage.months6": "6个月",
        "quick.kicker": "快捷控制",
        "dashboard.kicker": "本地知识库 / 本机索引",
        "dashboard.vaultLabel": "知识库",
        "search.kicker": "检索 / 本地索引",
        "search.vector": "向量",
        "notes.kicker": "笔记操作 / 安全写入",
        "header.kicker": "DEEPSEEK HARNESS / 本地知识",
        "settings.modeHint": "关键词 · 语义 · 混合",
        "settings.watchHint": "文件变化监听 · 防抖",
        "hint.keywordInline": "关键词模式 · 配置语义检索",
        "hint.keywordTitle": "当前使用关键词检索",
        "hint.keywordBody": "还没有配置 Embedding，因此检索走本地关键词匹配。到设置中配置 Embedding 模型，再把索引模式切换为混合或语义即可。",
        "hint.configure": "配置语义检索",
        "dashboard.health": "知识健康度",
        "dashboard.recent": "最近编辑",
        "dashboard.folders": "文件夹",
        "dashboard.tags": "常用标签",
        "dashboard.empty": "配置并索引知识库后，这里会出现你的数据大盘。",
        "search.placeholder": "输入关键词或前缀，结果会自动更新…",
        "search.button": "检索",
        "search.hybrid": "混合",
        "search.semantic": "语义",
        "search.keyword": "关键词",
        "search.empty": "检索知识库，组装有引用的上下文。",
        "search.noResults": "没有匹配的笔记。",
        "search.resultMeta": "{{mode}} · {{count}} 条结果",
        "search.add": "加入上下文",
        "search.added": "已在上下文",
        "search.snippet": "片段",
        "search.folder": "文件夹",
        "search.tag": "标签",
        "search.all": "全部",
        "context.title": "上下文",
        "context.empty": "从检索结果中选择笔记，组装上下文包。",
        "context.token": "约 {{count}} 个 Token",
        "context.copyDone": "上下文已复制到剪贴板。",
        "context.copied": "已复制",
        "notes.filter": "筛选笔记…",
        "notes.empty": "索引中还没有笔记。",
        "notes.select": "选择一篇笔记查看内容。",
        "notes.frontmatter": "前置元数据（Frontmatter）",
        "notes.links": "链接",
        "notes.words": "字数",
        "notes.updated": "更新于",
        "settings.vault": "知识库",
        "settings.vaultPath": "知识库路径",
        "settings.vaultHint": "本地 Obsidian 知识库的绝对路径。",
        "settings.index": "索引",
        "settings.indexMode": "索引模式",
        "settings.embedding": "向量服务",
        "settings.embeddingUrl": "服务地址",
        "settings.embeddingModel": "模型",
        "settings.embeddingKey": "API 密钥",
        "settings.embeddingKeyHint": "可选，仅保存在插件本地数据目录。",
        "settings.dimensions": "向量维度",
        "settings.watch": "监听文件变化",
        "settings.autoWrite": "允许自动写入（不推荐）",
        "settings.autoWriteHint": "关闭时，每次写入都需要用户确认。",
        "settings.privacy": "索引、向量和设置留在本机。非本机 Embedding 服务会收到待向量化的 Markdown 片段；如需正文不出本机，请使用回环地址或关键词检索。",
        "settings.testOk": "向量服务连接成功 · {{dims}} 维",
        "settings.saved": "设置已保存。",
        "settings.embeddingFailed": "向量服务测试失败：{{error}}",
        "settings.reindexStarted": "已开始重建索引。",
        "setup.title": "连接你的 Obsidian 知识库",
        "setup.body": "把 Vault Studio 指向本地知识库。关键词索引在本机构建；远程向量服务可稍后单独配置。",
        "setup.path": "知识库路径",
        "setup.button": "连接知识库",
        "write.title": "写入提案",
        "write.create": "新建笔记",
        "write.append": "追加到笔记",
        "write.path": "目标路径",
        "write.content": "Markdown 内容",
        "write.reason": "写入原因",
        "write.preview": "写入前检查变更",
        "write.saved": "已写入 {{path}}",
        "write.undo": "撤销",
        "write.undone": "已撤销写入。",
        "error.prefix": "出错了：",
        "error.noRemote": "Vault Host 服务不可用。",
        "error.clipboard": "当前环境无法访问剪贴板。",
        "loading": "加载中…",
        "never": "从未",
        "dashboard.healthSub": "孤立笔记 · 失效双链 · 长期未更新",
        "dashboard.peak": "峰值 {{max}} 次编辑 · {{mode}} 索引",
        "health.label": "健康度",
        "health.orphans": "孤立笔记",
        "health.broken": "失效双链",
        "health.stale": "长期未更新",
        "health.embedding": "向量化",
        "health.ready": "就绪",
        "notes.lead": "读取、追加与新建 Markdown 笔记；删除和覆盖被有意移除。",
        "settings.embeddingHint": "OpenAI 兼容或 Ollama 向量端点",
        "settings.dimensionsHint": "必须与模型输出一致",
        "settings.optional": "可选",
        "settings.embeddingKeySaved": "密钥已保存在本地。留空表示保持现有密钥，填写新值则替换。",
        "settings.embeddingKeyEmpty": "可选，留空表示不使用 API 密钥。",
        "layout.main": "Vault Studio 知识库",
        "search.resultsCount": "{{count}} 条结果",
        "index.title": "索引状态",
        "index.building": "构建",
        "index.embedding": "向量化",
        "index.chunks": "片段",
        "index.vectors": "向量",
        "index.idle": "空闲",
        "index.ready": "就绪",
        "github.kicker": "开源项目 · 与社区共建",
        "github.title": "在 GitHub 上关注 Obsidian Vault Studio",
        "github.body": "新功能与修复会先在仓库发布。给项目点个 Star 关注更新，也欢迎提 Issue 告诉我们你希望它变成什么样。",
        "github.cta": "去 GitHub 加 Star",
        "github.aria": "在 GitHub 上打开 dsh-obsidian-bridge 仓库",
        "github.repo": "spark-ai-boy / dsh-obsidian-bridge"
      }
    };

    const METHODS = [
      ["stats", []],
      ["search", ["query", "options"]],
      ["listNotes", ["options"]],
      ["readNote", ["path"]],
      ["proposeWrite", ["request"]],
      ["applyWrite", ["proposalId"]],
      ["undoWrite", ["undoId"]],
      ["getSettings", []],
      ["updateSettings", ["settings"]],
      ["testEmbedding", ["settings"]],
      ["reindex", []],
      ["indexStatus", []],
      ["usage", []]
    ];

    /**
     * The Typert registry validates strict descriptors before mounting. These
     * Client descriptors are hand-authored (no generated artifact), so supply
     * the metadata it requires. Invocation itself only wires the arguments;
     * the Host owns the real JSON codecs.
     */
    const strictCodec = (subject) => ({
      mode: "strict",
      typeSymbol: `dsh-obsidian-bridge#${subject}`,
      create: () => ({ parse: (value) => value })
    });

    const remoteContribution = {
      package: "dsh-obsidian-bridge",
      descriptors: METHODS.map(([method, parameters]) => ({
        id: `dsh-obsidian-bridge#${NAMESPACE}/${method}`,
        namespace: NAMESPACE,
        method,
        service: NAMESPACE,
        invocation: { kind: "direct" },
        description: `Obsidian Vault Studio: ${method}`,
        parameters: parameters.map((parameter) => ({
          name: parameter,
          wire: parameter,
          source: "json",
          codec: strictCodec(`${NAMESPACE}/${method}:${parameter}`),
          description: parameter
        })),
        result: strictCodec(`${NAMESPACE}/${method}:result`)
      })),
      methods: {}
    };

    const CSS = `
.vs-root { --vs-fg: var(--dsw-alias-label-primary, #1d1d20); --vs-muted: var(--dsw-alias-label-tertiary, #6e7078); --vs-soft: var(--dsw-alias-label-caption, #9698a0); --vs-bg: var(--dsw-alias-bg-base, #f7f6f2); --vs-card: var(--dsw-alias-bg-layer-1, #fff); --vs-card2: var(--dsw-alias-bg-layer-2, #f1f0eb); --vs-line: var(--dsw-alias-border-l2, rgba(20,20,25,.1)); --vs-line2: var(--dsw-alias-border-l3, rgba(20,20,25,.16)); --vs-accent: var(--dsw-alias-link, #4f66df); --vs-violet: #8b6fef; --vs-green: var(--dsw-alias-state-success-primary, #1d8d5e); --vs-warn: var(--dsw-alias-state-warn-label, #a86d18); color: var(--vs-fg); background: var(--vs-bg); min-height: 100%; padding: 26px 30px 42px; font-family: var(--dsw-font-family, "PingFang SC", "Microsoft YaHei", sans-serif); font-size: 13px; line-height: 1.5; }
.vs-title { font-family: var(--dsw-font-family, "PingFang SC", "Microsoft YaHei", sans-serif); font-size: 34px; line-height: 1.05; letter-spacing: -.035em; font-weight: 500; margin: 4px 0 5px; }
.vs-kicker { color: var(--vs-soft); font-size: 9px; letter-spacing: .13em; text-transform: uppercase; font-family: var(--dsw-font-mono, "SFMono-Regular", Menlo, monospace); }
.vs-sub { color: var(--vs-muted); font-size: 11px; margin: 0; }
.vs-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; border-bottom: 1px solid var(--vs-line); padding-bottom: 18px; margin-bottom: 16px; }
.vs-head-actions { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.vs-btn { height: 30px; padding: 0 10px; border-radius: 7px; border: 1px solid var(--vs-line); background: var(--vs-card); color: var(--vs-muted); font-size: 9.5px; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; transition: .16s; }
.vs-btn:hover { color: var(--vs-fg); border-color: var(--vs-line2); background: var(--vs-card2); }
.vs-btn.primary { background: var(--vs-fg); color: var(--vs-bg); border-color: transparent; }
.vs-btn.primary:hover { opacity: .9; color: var(--vs-bg); }
.vs-btn.danger { color: var(--dsw-alias-state-error-primary, #b23b3b); }
.vs-btn:disabled { opacity: .5; cursor: wait; }
.vs-spinner { width: 12px; height: 12px; display: inline-block; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: vs-spin .65s linear infinite; }
@keyframes vs-spin { to { transform: rotate(360deg); } }
.vs-btn:active:not(:disabled) { transform: translateY(1px); }
.vs-btn.success { color: var(--vs-green); border-color: color-mix(in srgb, var(--vs-green) 45%, var(--vs-line)); background: color-mix(in srgb, var(--vs-green) 8%, var(--vs-card)); }
.vs-btn.success:hover { color: var(--vs-green); border-color: var(--vs-green); background: color-mix(in srgb, var(--vs-green) 12%, var(--vs-card)); }
.vs-btn svg { width: 11px; height: 11px; }
.vs-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 7px; border-radius: 20px; background: var(--vs-card2); color: var(--vs-muted); font-family: var(--dsw-font-mono, monospace); font-size: 7.5px; white-space: nowrap; }
.vs-badge.ok { color: var(--vs-green); background: color-mix(in srgb, var(--vs-green) 10%, transparent); }
.vs-badge.work { color: var(--vs-warn); background: color-mix(in srgb, var(--vs-warn) 10%, transparent); }
.vs-badge.bad { color: var(--dsw-alias-state-error-primary, #b23b3b); background: color-mix(in srgb, #b23b3b 10%, transparent); }
.vs-tabs { display: flex; gap: 2px; margin-bottom: 20px; border-bottom: 1px solid var(--vs-line); }
.vs-tab { border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--vs-muted); padding: 8px 12px; font-size: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.vs-tab:hover { color: var(--vs-fg); }
.vs-tab.active { color: var(--vs-fg); border-bottom-color: var(--vs-accent); font-weight: 600; }
.vs-grid { display: grid; gap: 10px; }
.vs-grid-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.vs-grid-2 { grid-template-columns: minmax(0, 1.4fr) minmax(280px, .8fr); }
.vs-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.vs-card { border: 1px solid var(--vs-line); border-radius: 10px; background: var(--vs-card); padding: 14px; min-width: 0; }
.vs-card-title { font-size: 10px; font-weight: 600; margin: 0 0 3px; }
.vs-card-sub { color: var(--vs-soft); font-size: 8px; margin: 0 0 12px; }
.vs-stat-label { color: var(--vs-muted); font-size: 8.5px; }
.vs-stat-value { font-family: var(--dsw-font-family, "PingFang SC", "Microsoft YaHei", sans-serif); font-size: 29px; line-height: 1.1; letter-spacing: -.04em; margin-top: 5px; }
.vs-stat-value small { font-family: var(--dsw-font-mono, monospace); font-size: 7px; color: var(--vs-soft); margin-left: 4px; letter-spacing: 0; }
.vs-stat-foot { color: var(--vs-soft); font-family: var(--dsw-font-mono, monospace); font-size: 7px; margin-top: 7px; }
.vs-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; padding: 8px 0 18px; }
.vs-hero h2 { font-family: var(--dsw-font-family, "PingFang SC", "Microsoft YaHei", sans-serif); font-size: 25px; font-weight: 500; letter-spacing: -.03em; margin: 4px 0; }
.vs-hero p { color: var(--vs-muted); font-size: 10px; margin: 0; max-width: 630px; }
.vs-activity { display: flex; align-items: flex-end; gap: 4px; height: 128px; margin-top: 14px; }
.vs-activity-day { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; justify-content: flex-end; }
.vs-activity-bar { width: 100%; max-width: 22px; min-height: 2px; background: var(--vs-violet); border-radius: 2px 2px 0 0; opacity: .8; }
.vs-activity-label { font-family: var(--dsw-font-mono, monospace); font-size: 6px; color: var(--vs-soft); white-space: nowrap; }
.vs-list { display: flex; flex-direction: column; }
.vs-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--vs-line); cursor: pointer; }
.vs-row:last-child { border-bottom: 0; }
.vs-row:hover .vs-row-title { color: var(--vs-accent); }
.vs-row-main { min-width: 0; flex: 1; }
.vs-row-title { font-size: 9.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-row-meta { color: var(--vs-soft); font-family: var(--dsw-font-mono, monospace); font-size: 6.8px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-row-side { color: var(--vs-soft); font-family: var(--dsw-font-mono, monospace); font-size: 6.8px; white-space: nowrap; }
.vs-tag { display: inline-flex; align-items: center; padding: 2px 5px; border-radius: 4px; background: var(--vs-card2); color: var(--vs-muted); font-size: 7px; font-family: var(--dsw-font-mono, monospace); }
.vs-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.vs-health { display: flex; align-items: center; gap: 16px; }
.vs-ring { position: relative; width: 112px; height: 112px; border-radius: 50%; flex: 0 0 auto; background: conic-gradient(var(--vs-violet) var(--score), var(--vs-card2) 0); display: grid; place-items: center; transform: rotate(-90deg); }
.vs-ring::before { content: ""; position: absolute; inset: 12px; border-radius: 50%; background: var(--vs-card); }
.vs-ring > div { position: relative; z-index: 1; transform: rotate(90deg); text-align: center; }
.vs-ring b { display: block; font-family: "Iowan Old Style", "Songti SC", serif; font-size: 28px; font-weight: 500; line-height: 1; }
.vs-ring span { display: block; color: var(--vs-soft); font-size: 6px; margin-top: 3px; }
.vs-health-list { flex: 1; min-width: 0; }
.vs-health-row { display: flex; justify-content: space-between; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--vs-line); font-size: 8px; color: var(--vs-muted); }
.vs-health-row:last-child { border: 0; }
.vs-health-row b { color: var(--vs-fg); font-family: var(--dsw-font-mono, monospace); font-weight: 500; }
.vs-searchbar { display: flex; gap: 8px; margin-bottom: 12px; }
.vs-input { flex: 1; min-width: 0; height: 39px; border: 1px solid var(--vs-line2); border-radius: 8px; background: var(--vs-card); color: var(--vs-fg); padding: 0 12px; font-size: 11px; outline: none; }
.vs-input:focus { border-color: var(--vs-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--vs-accent) 12%, transparent); }
.vs-searchbar .vs-btn { height: 39px; padding: 0 15px; }
.vs-search-controls { display: flex; align-items: center; gap: 8px; justify-content: space-between; margin-bottom: 12px; }
.vs-search-filters { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.vs-segment { display: flex; border: 1px solid var(--vs-line); border-radius: 7px; padding: 2px; background: var(--vs-card); }
.vs-segment button { border: 0; background: transparent; border-radius: 5px; color: var(--vs-muted); padding: 4px 8px; font-size: 8px; cursor: pointer; }
.vs-segment button.active { background: var(--vs-card2); color: var(--vs-fg); }
.vs-select { height: 27px; border: 1px solid var(--vs-line); border-radius: 6px; background: var(--vs-card); color: var(--vs-muted); padding: 0 6px; font-size: 8px; max-width: 150px; }
.vs-results-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 12px; align-items: start; }
.vs-results { display: flex; flex-direction: column; gap: 7px; }
.vs-result { border: 1px solid var(--vs-line); border-radius: 8px; padding: 11px 12px; background: var(--vs-card); cursor: pointer; transition: .15s; }
.vs-result:hover { border-color: var(--vs-line2); background: var(--vs-card2); }
.vs-result.selected { border-color: color-mix(in srgb, var(--vs-violet) 55%, var(--vs-line)); background: color-mix(in srgb, var(--vs-violet) 5%, var(--vs-card)); }
.vs-result-head { display: flex; align-items: flex-start; gap: 8px; }
.vs-result-title { font-size: 10.5px; font-weight: 600; line-height: 1.4; margin: 0; }
.vs-result-path { color: var(--vs-soft); font-family: var(--dsw-font-mono, monospace); font-size: 6.8px; margin: 3px 0 6px; overflow-wrap: anywhere; }
.vs-result-snippet { color: var(--vs-muted); font-size: 8.8px; line-height: 1.6; margin: 0 0 7px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.vs-result-foot { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.vs-score { margin-left: auto; color: var(--vs-violet); font-family: var(--dsw-font-mono, monospace); font-size: 7px; }
.vs-context { position: sticky; top: 0; }
.vs-context-item { display: flex; gap: 7px; padding: 8px 0; border-bottom: 1px solid var(--vs-line); }
.vs-context-item:last-child { border-bottom: 0; }
.vs-context-index { color: var(--vs-soft); font-family: var(--dsw-font-mono, monospace); font-size: 7px; padding-top: 1px; }
.vs-context-main { min-width: 0; flex: 1; }
.vs-context-title { font-size: 8.8px; line-height: 1.35; }
.vs-context-path { color: var(--vs-soft); font-family: var(--dsw-font-mono, monospace); font-size: 6.5px; margin-top: 2px; overflow-wrap: anywhere; }
.vs-remove { border: 0; background: transparent; color: var(--vs-soft); cursor: pointer; font-size: 12px; line-height: 1; padding: 0 2px; }
.vs-remove:hover { color: var(--dsw-alias-state-error-primary, #b23b3b); }
.vs-context-actions { display: flex; gap: 6px; margin-top: 10px; }
.vs-muted { color: var(--vs-muted); font-size: 8.5px; line-height: 1.65; }
.vs-empty { border: 1px dashed var(--vs-line2); border-radius: 9px; padding: 32px 18px; text-align: center; color: var(--vs-muted); font-size: 9px; }
.vs-empty svg { width: 23px; height: 23px; margin: 0 auto 8px; color: var(--vs-soft); }
.vs-notes-layout { display: grid; grid-template-columns: minmax(240px, .85fr) minmax(0, 1.15fr); gap: 12px; align-items: start; }
.vs-note-row { display: flex; gap: 7px; align-items: center; padding: 8px 9px; border-radius: 6px; cursor: pointer; }
.vs-note-row:hover { background: var(--vs-card2); }
.vs-note-row.active { background: color-mix(in srgb, var(--vs-violet) 8%, var(--vs-card)); }
.vs-note-row-main { min-width: 0; flex: 1; }
.vs-note-row-title { font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-note-row-path { color: var(--vs-soft); font-family: var(--dsw-font-mono, monospace); font-size: 6.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-note-content { white-space: pre-wrap; font-size: 9px; line-height: 1.75; color: var(--vs-muted); max-height: 460px; overflow: auto; }
.vs-note-content h1, .vs-note-content h2, .vs-note-content h3 { color: var(--vs-fg); }
.vs-note-actions { display: flex; gap: 6px; flex-wrap: wrap; margin: 10px 0; }
.vs-field { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 8px 0; border-top: 1px solid var(--vs-line); }
.vs-field:first-child { border-top: 0; }
.vs-field-copy { min-width: 0; }
.vs-field-label { font-size: 9px; }
.vs-field-hint { color: var(--vs-soft); font-size: 7.5px; margin-top: 2px; }
.vs-field input, .vs-field select { width: 210px; height: 29px; padding: 0 8px; border: 1px solid var(--vs-line); border-radius: 6px; background: var(--vs-card2); color: var(--vs-fg); font-family: var(--dsw-font-mono, monospace); font-size: 8px; outline: none; }
.vs-field input:focus, .vs-field select:focus { border-color: var(--vs-accent); }
.vs-switch { width: 31px; height: 17px; border-radius: 20px; border: 1px solid var(--vs-line); background: var(--vs-card2); position: relative; cursor: pointer; flex: 0 0 auto; }
.vs-switch::after { content: ""; position: absolute; width: 11px; height: 11px; left: 2px; top: 2px; border-radius: 50%; background: var(--vs-muted); transition: .18s; }
.vs-switch[aria-checked="true"] { background: var(--vs-violet); border-color: var(--vs-violet); }
.vs-switch[aria-checked="true"]::after { transform: translateX(14px); background: #fff; }
.vs-notice { position: fixed; right: 24px; bottom: 24px; z-index: 20; max-width: 360px; padding: 10px 12px; border: 1px solid var(--vs-line2); border-radius: 8px; background: var(--vs-card); box-shadow: 0 18px 55px -22px rgba(0,0,0,.4); color: var(--vs-fg); font-size: 9px; }
.vs-notice.error { color: var(--dsw-alias-state-error-primary, #b23b3b); }
.vs-modal-back { position: fixed; inset: 0; z-index: 15; background: rgba(8,8,12,.45); display: flex; align-items: center; justify-content: center; padding: 20px; }
.vs-modal { width: min(620px, 100%); max-height: 86vh; overflow: auto; border: 1px solid var(--vs-line2); border-radius: 12px; background: var(--vs-card); color: var(--vs-fg); padding: 18px; box-shadow: 0 30px 90px -30px rgba(0,0,0,.55); }
.vs-modal-title { font-family: "Iowan Old Style", "Songti SC", serif; font-size: 22px; font-weight: 500; margin: 0 0 3px; }
.vs-modal-sub { color: var(--vs-muted); font-size: 8.5px; margin: 0 0 14px; }
.vs-textarea { width: 100%; min-height: 150px; resize: vertical; border: 1px solid var(--vs-line); border-radius: 7px; background: var(--vs-card2); color: var(--vs-fg); padding: 9px; font-size: 10px; line-height: 1.6; outline: none; }
.vs-textarea:focus { border-color: var(--vs-accent); }
.vs-diff { white-space: pre-wrap; max-height: 240px; overflow: auto; padding: 9px; border-radius: 7px; background: var(--vs-card2); color: var(--vs-muted); font-family: var(--dsw-font-mono, monospace); font-size: 8px; line-height: 1.6; }
.vs-diff .add { color: var(--vs-green); }
.vs-settings-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 12px; align-items: start; }
.vs-progress { height: 4px; background: var(--vs-card2); border-radius: 4px; overflow: hidden; margin-top: 8px; }
.vs-progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--vs-violet), var(--vs-accent)); }
.vs-actions-right { display: flex; gap: 6px; justify-content: flex-end; margin-top: 14px; }
.vs-clickable { cursor: pointer; }
.vs-no-wrap { white-space: nowrap; }
@media (max-width: 1100px) { .vs-grid-5 { grid-template-columns: repeat(3, minmax(0, 1fr)); } .vs-results-layout, .vs-settings-grid, .vs-notes-layout { grid-template-columns: 1fr; } .vs-context { position: static; } }
@media (max-width: 760px) { .vs-root { padding: 18px 14px 30px; } .vs-header { align-items: flex-start; flex-direction: column; } .vs-grid-5, .vs-grid-2, .vs-grid-3 { grid-template-columns: 1fr 1fr; } .vs-grid-2 { grid-template-columns: 1fr; } .vs-field { align-items: flex-start; flex-direction: column; gap: 6px; } .vs-field input, .vs-field select { width: 100%; } .vs-searchbar { flex-direction: column; } .vs-searchbar .vs-btn { height: 34px; } .vs-activity { height: 105px; } }
@media (max-width: 480px) { .vs-grid-5, .vs-grid-3 { grid-template-columns: 1fr 1fr; } .vs-title { font-size: 29px; } }
/* Typography follows the host composition instead of introducing a second scale. */
.vs-root { font: var(--dsw-font-s-14); font-family: var(--dsw-font-family); }
.vs-title { font: 600 30px/38px var(--dsw-font-family); letter-spacing: -.02em; }
.vs-hero h2 { font: 600 22px/30px var(--dsw-font-family); letter-spacing: -.01em; }
.vs-kicker { font: var(--dsw-font-xxxs-11); letter-spacing: .1em; }
.vs-sub { font: var(--dsw-font-xs-13); }
.vs-btn { font: var(--dsw-font-xs-13); height: 34px; padding: 0 12px; }
.vs-btn svg { width: 14px; height: 14px; }
.vs-badge { font: var(--dsw-font-xxs-12); padding: 4px 8px; }
.vs-tab { font: var(--dsw-font-xs-13); padding: 10px 14px; }
.vs-card-title { font: 600 14px/20px var(--dsw-font-family); }
.vs-card-sub { font: var(--dsw-font-xxs-12); }
.vs-stat-label { font: var(--dsw-font-xxs-12); }
.vs-stat-value { font: 600 30px/36px var(--dsw-font-family); }
.vs-stat-foot { font: var(--dsw-font-xxxs-11); }
.vs-activity-label { font: var(--dsw-font-xxxs-11); }
.vs-row-title, .vs-note-row-title { font: var(--dsw-font-xs-13); }
.vs-row-meta, .vs-row-side, .vs-note-row-path { font: var(--dsw-font-xxxs-11); }
.vs-tag { font: var(--dsw-font-xxs-12); padding: 3px 7px; }
.vs-health-row, .vs-health-row b { font: var(--dsw-font-xs-13); }
.vs-ring b { font: 600 30px/34px var(--dsw-font-family); }
.vs-ring span { font: var(--dsw-font-xxxs-11); }
.vs-searchbar .vs-btn { height: 40px; font: var(--dsw-font-xs-13); }
.vs-input { font: var(--dsw-font-xs-13); height: 40px; }
.vs-select { font: var(--dsw-font-xxs-12); height: 30px; }
.vs-result-title { font: 600 14px/20px var(--dsw-font-family); }
.vs-result-path { font: var(--dsw-font-xxxs-11); }
.vs-result-snippet { font: var(--dsw-font-xs-13); line-height: 1.65; }
.vs-score { font: var(--dsw-font-xxs-12); }
.vs-context-title { font: var(--dsw-font-xs-13); }
.vs-context-path, .vs-context-index { font: var(--dsw-font-xxxs-11); }
.vs-muted { font: var(--dsw-font-xs-13); line-height: 1.6; }
.vs-empty { font: var(--dsw-font-xs-13); }
.vs-note-content { font: var(--dsw-font-s-14); line-height: 1.75; }
.vs-field-label { font: var(--dsw-font-xs-13); }
.vs-field-hint { font: var(--dsw-font-xxs-12); }
.vs-field input, .vs-field select { font: var(--dsw-font-xs-13); height: 34px; width: 240px; }
.vs-notice { font: var(--dsw-font-xs-13); }
.vs-modal-title { font: 600 24px/32px var(--dsw-font-family); }
.vs-modal-sub { font: var(--dsw-font-xs-13); }
.vs-textarea { font: var(--dsw-font-xs-13); line-height: 1.65; }
.vs-diff { font: var(--dsw-font-xxs-12); line-height: 1.65; }
/* Dashboard composition */
.vs-root { box-sizing: border-box; height: 100%; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; scrollbar-gutter: stable; }
.vs-dashboard { display: flex; flex-direction: column; gap: 12px; }
.vs-hero { align-items: center; }
.vs-hero-copy { flex: 1; min-width: 0; }
.vs-dashboard .vs-hero h2 { font: 600 34px/42px var(--dsw-font-family); letter-spacing: -.025em; margin: 4px 0 7px; }
.vs-hero p { font: var(--dsw-font-xs-13); line-height: 1.7; max-width: 620px; }
.vs-hero-search { display: flex; align-items: center; gap: 8px; max-width: 620px; height: 46px; padding: 0 7px 0 13px; margin-top: 14px; border: 1px solid var(--vs-line2); border-radius: 9px; background: var(--vs-card); box-shadow: 0 10px 30px -26px rgba(0,0,0,.4); transition: .16s; }
.vs-hero-search:focus-within { border-color: var(--vs-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--vs-accent) 12%, transparent); }
.vs-hero-search > svg { color: var(--vs-soft); flex: none; }
.vs-hero-search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; color: var(--vs-fg); font: var(--dsw-font-xs-13); }
.vs-hero-search input::placeholder { color: var(--vs-soft); }
.vs-hero-search-button { height: 32px; padding: 0 13px; border: 0; border-radius: 6px; background: var(--vs-fg); color: var(--vs-bg); font: var(--dsw-font-xs-13); cursor: pointer; }
.vs-hero-search-button:hover { opacity: .88; }
.vs-hero-enter { color: var(--vs-soft); font: var(--dsw-font-xxs-12); padding: 0 3px; }
.vs-suggestions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 11px; }
.vs-suggestions-label { color: var(--vs-soft); font: var(--dsw-font-xxs-12); margin-right: 2px; }
.vs-suggest { border: 1px solid var(--vs-line); border-radius: 20px; background: transparent; color: var(--vs-muted); font: var(--dsw-font-xxs-12); padding: 3px 9px; cursor: pointer; }
.vs-suggest:hover { color: var(--vs-fg); background: var(--vs-card2); border-color: var(--vs-line2); }
.vs-orbit { position: relative; width: 300px; height: 235px; flex: 0 0 auto; margin-right: 10px; }
.vs-orbit-ring { position: absolute; left: 50%; top: 50%; border: 1px solid var(--vs-line); border-radius: 50%; transform: translate(-50%, -50%); }
.vs-orbit-ring.r1 { width: 94px; height: 94px; }
.vs-orbit-ring.r2 { width: 166px; height: 166px; border-style: dashed; opacity: .8; }
.vs-orbit-ring.r3 { width: 232px; height: 232px; opacity: .55; }
.vs-orbit-core { position: absolute; left: 50%; top: 50%; width: 82px; height: 82px; border-radius: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--vs-fg); color: var(--vs-bg); box-shadow: 0 0 0 8px color-mix(in srgb, var(--vs-violet) 12%, transparent); }
.vs-orbit-core b { font: 600 26px/28px var(--dsw-font-family); }
.vs-orbit-core span { font: var(--dsw-font-xxxs-11); opacity: .72; margin-top: 2px; }
.vs-orbit-chip { position: absolute; max-width: 92px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 4px 8px; border: 1px solid var(--vs-line); border-radius: 20px; background: var(--vs-card); color: var(--vs-muted); font: var(--dsw-font-xxs-12); box-shadow: 0 8px 22px -18px rgba(0,0,0,.5); }
.vs-orbit-chip.c1 { top: 5%; left: 2%; color: var(--vs-violet); border-color: color-mix(in srgb, var(--vs-violet) 35%, var(--vs-line)); }
.vs-orbit-chip.c2 { top: 17%; right: 0; }
.vs-orbit-chip.c3 { bottom: 16%; left: 0; }
.vs-orbit-chip.c4 { bottom: 4%; right: 5%; color: var(--vs-accent); border-color: color-mix(in srgb, var(--vs-accent) 35%, var(--vs-line)); }
.vs-access { display: flex; align-items: center; gap: 11px; padding: 11px 13px; border: 1px solid var(--vs-line); border-radius: 9px; background: var(--vs-card); }
.vs-access > svg { flex: none; color: var(--vs-soft); }
.vs-access.on { border-color: color-mix(in srgb, var(--vs-green) 28%, var(--vs-line)); background: color-mix(in srgb, var(--vs-green) 5%, var(--vs-card)); }
.vs-access.on > svg { color: var(--vs-green); }
.vs-access.off { border-color: color-mix(in srgb, var(--vs-warn) 30%, var(--vs-line)); background: color-mix(in srgb, var(--vs-warn) 5%, var(--vs-card)); }
.vs-access.off > svg { color: var(--vs-warn); }
.vs-access-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.vs-access-copy b { font: 600 13px/18px var(--dsw-font-family); }
.vs-access-copy span { color: var(--vs-muted); font: var(--dsw-font-xxs-12); line-height: 1.55; }
.vs-access-switch { flex: none; height: 30px; min-width: 96px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 10px; border: 1px solid var(--vs-line2); border-radius: 20px; background: var(--vs-card); color: var(--vs-muted); font: var(--dsw-font-xxs-12); cursor: pointer; }
.vs-access-switch i { width: 8px; height: 8px; border-radius: 50%; background: var(--vs-soft); }
.vs-access.on .vs-access-switch { color: var(--vs-green); border-color: color-mix(in srgb, var(--vs-green) 45%, var(--vs-line)); }
.vs-access.on .vs-access-switch i { background: var(--vs-green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--vs-green) 14%, transparent); }
.vs-access.off .vs-access-switch { color: var(--vs-warn); border-color: color-mix(in srgb, var(--vs-warn) 45%, var(--vs-line)); }
.vs-access.off .vs-access-switch i { background: var(--vs-warn); }
.vs-access-switch:hover { background: var(--vs-card2); }
.vs-hint { display: flex; align-items: center; gap: 11px; padding: 11px 13px; border: 1px solid color-mix(in srgb, var(--vs-violet) 24%, var(--vs-line)); border-radius: 9px; background: color-mix(in srgb, var(--vs-violet) 5%, var(--vs-card)); }
.vs-hint > svg { color: var(--vs-violet); flex: none; }
.vs-hint-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.vs-hint-copy b { font: 600 13px/18px var(--dsw-font-family); }
.vs-hint-copy span { color: var(--vs-muted); font: var(--dsw-font-xxs-12); line-height: 1.55; }
.vs-hint .vs-btn { flex: none; }
.vs-stat-grid { margin: 2px 0; }
.vs-dash-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 12px; align-items: stretch; }
.vs-span-7 { grid-column: span 7; min-width: 0; }
.vs-span-5 { grid-column: span 5; min-width: 0; }
.vs-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.vs-card-head .vs-card-title { margin-bottom: 2px; }
.vs-card-head .vs-card-sub { margin-bottom: 0; }
.vs-chart { margin-top: 2px; }
.vs-chart-svg { width: 100%; height: 205px; display: block; overflow: visible; }
.vs-chart-grid { stroke: var(--vs-line); stroke-width: 1; }
.vs-chart-line { fill: none; stroke: var(--vs-violet); stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; }
.vs-chart-dot { fill: var(--vs-card); stroke: var(--vs-violet); stroke-width: 1.8; }
.vs-chart-label { fill: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-chart-legend { display: flex; align-items: center; gap: 16px; color: var(--vs-soft); font: var(--dsw-font-xxs-12); padding-top: 2px; }
.vs-chart-legend span { display: inline-flex; align-items: center; gap: 5px; }
.vs-chart-swatch { display: inline-block; width: 12px; height: 3px; border-radius: 2px; background: var(--vs-violet); }
.vs-health { gap: 20px; }
.vs-health-list { width: 100%; }
.vs-recent-row { cursor: pointer; }
.vs-recent-index { width: 22px; flex: 0 0 auto; color: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-recent-icon { width: 28px; height: 28px; flex: 0 0 auto; border-radius: 7px; display: grid; place-items: center; background: var(--vs-card2); color: var(--vs-muted); }
.vs-constellation { margin: 0 -2px; }
.vs-constellation-svg { width: 100%; height: 218px; display: block; overflow: visible; }
.vs-constellation-edge { stroke: var(--vs-line2); stroke-width: 1; }
.vs-constellation-center { fill: var(--vs-card2); stroke: color-mix(in srgb, var(--vs-violet) 45%, var(--vs-line)); stroke-width: 1.2; }
.vs-constellation-center-label { fill: var(--vs-fg); font: 600 10px/12px var(--dsw-font-family); letter-spacing: .08em; }
.vs-constellation-center-count { fill: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-constellation-node { cursor: pointer; }
.vs-constellation-node circle { fill: color-mix(in srgb, var(--vs-violet) 15%, var(--vs-card)); stroke: color-mix(in srgb, var(--vs-violet) 55%, var(--vs-line)); stroke-width: 1; }
.vs-constellation-node:hover circle { fill: color-mix(in srgb, var(--vs-violet) 30%, var(--vs-card)); stroke: var(--vs-violet); }
.vs-constellation-node text { fill: var(--vs-muted); font: var(--dsw-font-xxxs-11); }
.vs-constellation-legend { display: flex; align-items: center; gap: 13px; padding: 0 4px 3px; color: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-constellation-legend span { display: inline-flex; align-items: center; gap: 5px; }
.vs-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--vs-muted); }
.vs-dot.violet { background: var(--vs-violet); }
.vs-constellation-empty { min-height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.vs-folder-list { display: flex; flex-direction: column; gap: 6px; padding-top: 10px; border-top: 1px solid var(--vs-line); margin-top: 2px; }
.vs-folder-row { display: grid; grid-template-columns: minmax(0, 110px) minmax(0, 1fr) 28px; align-items: center; gap: 8px; font: var(--dsw-font-xxs-12); color: var(--vs-muted); }
.vs-folder-row > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-folder-row i { height: 4px; border-radius: 4px; background: var(--vs-card2); overflow: hidden; }
.vs-folder-row i b { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--vs-violet), var(--vs-accent)); }
.vs-folder-row em { font-style: normal; text-align: right; color: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-note-content { overscroll-behavior: auto; }
.vs-usage { display: flex; flex-direction: column; gap: 8px; }
.vs-usage-total { display: flex; align-items: baseline; gap: 7px; }
.vs-usage-total b { font: 600 31px/34px var(--dsw-font-family); }
.vs-usage-total span { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-usage-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.vs-usage-kpi { padding: 7px 8px; border: 1px solid var(--vs-line); border-radius: 7px; background: var(--vs-card2); display: flex; flex-direction: column; gap: 1px; }
.vs-usage-kpi b { font: 600 16px/20px var(--dsw-font-family); }
.vs-usage-kpi span { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); white-space: nowrap; }
.vs-usage-section-head { display: flex; justify-content: space-between; color: var(--vs-muted); font: var(--dsw-font-xxxs-11); margin-top: 2px; }
.vs-usage-section-head em { color: var(--vs-soft); font-style: normal; }
.vs-usage-bars { height: 38px; display: flex; align-items: flex-end; gap: 3px; border-bottom: 1px solid var(--vs-line); padding: 0 1px 3px; }
.vs-usage-bar { flex: 1; height: 100%; display: flex; align-items: flex-end; min-width: 2px; }
.vs-usage-bar i { width: 100%; border-radius: 2px 2px 0 0; background: var(--vs-accent); opacity: .8; }
.vs-usage-months { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4px; }
.vs-usage-month { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 3px 0; border-radius: 5px; background: var(--vs-card2); }
.vs-usage-month b { font: 600 12px/14px var(--dsw-font-family); }
.vs-usage-month span { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-usage-tools { display: flex; flex-wrap: wrap; gap: 4px; }
.vs-usage-tools span { padding: 2px 6px; border-radius: 4px; background: var(--vs-card2); color: var(--vs-muted); font: var(--dsw-font-xxxs-11); }
.vs-usage-empty { min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.vs-composition { display: flex; flex-direction: column; gap: 12px; padding-top: 2px; }
.vs-composition-coverage-label { display: flex; justify-content: space-between; gap: 8px; color: var(--vs-muted); font: var(--dsw-font-xxs-12); margin-bottom: 6px; }
.vs-composition-coverage-label b { color: var(--vs-fg); font-weight: 500; }
.vs-composition-bar { height: 6px; border-radius: 6px; background: var(--vs-card2); overflow: hidden; }
.vs-composition-bar span { display: block; height: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--vs-violet), var(--vs-accent)); }
.vs-composition-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.vs-composition-stat { padding: 8px 9px; border: 1px solid var(--vs-line); border-radius: 8px; background: var(--vs-card2); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.vs-composition-stat b { font: 600 22px/26px var(--dsw-font-family); }
.vs-composition-stat span { color: var(--vs-muted); font: var(--dsw-font-xxxs-11); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-composition-stat em { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); font-style: normal; white-space: nowrap; }
.vs-core-list { display: flex; flex-direction: column; }
.vs-core-row { display: flex; align-items: center; gap: 8px; padding: 9px 2px; border-bottom: 1px solid var(--vs-line); cursor: pointer; }
.vs-core-row:last-child { border-bottom: 0; }
.vs-core-row:hover .vs-core-title { color: var(--vs-accent); }
.vs-core-rank { width: 20px; flex: none; color: var(--vs-soft); font: var(--dsw-font-xxxs-11); }
.vs-core-main { flex: 1; min-width: 0; }
.vs-core-title { font: var(--dsw-font-xs-13); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-core-meta { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-core-inbound { flex: none; min-width: 24px; text-align: right; color: var(--vs-violet); font: 600 15px/18px var(--dsw-font-family); }
.vs-core-empty { min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.vs-heatmap-card { padding: 11px 12px 9px; }
.vs-heatmap-layout { display: flex; align-items: center; gap: 22px; }
.vs-heatmap-layout .vs-heatmap { flex: 1; min-width: 0; }
.vs-heatmap-summary { flex: 0 0 260px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.vs-heatmap-stat { padding: 7px 9px; border: 1px solid var(--vs-line); border-radius: 7px; background: var(--vs-card2); display: flex; flex-direction: column; gap: 1px; }
.vs-heatmap-stat b { font: 600 18px/22px var(--dsw-font-family); }
.vs-heatmap-stat span { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); white-space: nowrap; }
@media (max-width: 900px) { .vs-heatmap-layout { flex-direction: column; align-items: stretch; gap: 10px; } .vs-heatmap-summary { flex: none; grid-template-columns: repeat(4, minmax(0, 1fr)); } }

.vs-heatmap { overflow-x: auto; padding: 2px 0 1px; scrollbar-width: thin; }
.vs-heatmap-scroll { width: max-content; min-width: 100%; }
.vs-heatmap-weeks { display: flex; gap: 4px; padding: 4px 0 2px; width: max-content; }
.vs-heatmap-week { display: flex; flex-direction: column; gap: 4px; }
.vs-heatmap-cell { display: block; width: 12px; height: 12px; border-radius: 2px; background: var(--vs-card2); }
.vs-heatmap-cell.empty { background: transparent; }
.vs-heatmap-cell.level-0 { background: var(--vs-card2); }
.vs-heatmap-cell.level-1 { background: color-mix(in srgb, var(--vs-violet) 24%, var(--vs-card2)); }
.vs-heatmap-cell.level-2 { background: color-mix(in srgb, var(--vs-violet) 45%, var(--vs-card2)); }
.vs-heatmap-cell.level-3 { background: color-mix(in srgb, var(--vs-violet) 70%, var(--vs-card2)); }
.vs-heatmap-cell.level-4 { background: var(--vs-violet); }
.vs-heatmap-legend { display: flex; align-items: center; justify-content: flex-end; gap: 4px; color: var(--vs-soft); font: var(--dsw-font-xxxs-11); padding-top: 3px; }
.vs-heatmap-legend span { margin: 0 2px; }
.vs-heatmap-legend i { width: 10px; height: 10px; }
.vs-heatmap-empty { min-height: 58px; display: flex; align-items: center; justify-content: center; }
/* Right-side quick controls replace the decorative orbit. */
.vs-quick { width: 300px; flex: 0 0 auto; border: 1px solid var(--vs-line); border-radius: 10px; background: var(--vs-card); padding: 11px 12px 9px; box-shadow: 0 14px 40px -34px rgba(0,0,0,.45); }
.vs-quick-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-bottom: 7px; border-bottom: 1px solid var(--vs-line); margin-bottom: 3px; }
.vs-quick-title { font: 600 15px/20px var(--dsw-font-family); margin-top: 2px; }
.vs-quick-row { display: flex; align-items: center; gap: 8px; min-height: 42px; border-bottom: 1px solid var(--vs-line); }
.vs-quick-icon { width: 25px; height: 25px; flex: none; border-radius: 7px; display: grid; place-items: center; background: var(--vs-card2); color: var(--vs-muted); }
.vs-quick-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 1px; }
.vs-quick-copy b { font: var(--dsw-font-xxs-12); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-quick-copy span { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-quick-toggle { width: 32px; height: 18px; flex: none; border: 1px solid var(--vs-line2); border-radius: 20px; background: var(--vs-card2); position: relative; cursor: pointer; padding: 0; }
.vs-quick-toggle i { position: absolute; width: 12px; height: 12px; top: 2px; left: 2px; border-radius: 50%; background: var(--vs-soft); transition: .16s; }
.vs-quick-toggle.on { background: var(--vs-violet); border-color: var(--vs-violet); }
.vs-quick-toggle.on i { left: 16px; background: #fff; }
.vs-quick-select { width: 88px; height: 27px; flex: none; border: 1px solid var(--vs-line); border-radius: 6px; background: var(--vs-card2); color: var(--vs-muted); font: var(--dsw-font-xxxs-11); padding: 0 4px; }
.vs-quick-footer { width: 100%; height: 28px; margin-top: 4px; border: 0; background: transparent; color: var(--vs-muted); font: var(--dsw-font-xxs-12); display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 0 3px; }
.vs-quick-footer svg:last-child { margin-left: auto; color: var(--vs-soft); }
.vs-quick-footer:hover { color: var(--vs-fg); }
@media (max-width: 1180px) { .vs-quick { width: 270px; } }
@media (max-width: 900px) { .vs-quick { width: 100%; margin-top: 8px; } }
/* Compact top: keep the dashboard metrics above the fold. */
.vs-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 9px; margin-bottom: 10px; border-bottom: 1px solid var(--vs-line); }
.vs-topline-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.vs-topline-left .vs-kicker { white-space: nowrap; }
.vs-topline-path { color: var(--vs-muted); font: var(--dsw-font-xxxs-11); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 48vw; }
.vs-header { align-items: center; padding-bottom: 12px; margin-bottom: 12px; }
.vs-title { font: 600 27px/34px var(--dsw-font-family); margin: 2px 0 3px; }
.vs-sub { font: var(--dsw-font-xxs-12); }
.vs-tabs { margin-bottom: 12px; }
.vs-tab { padding: 8px 12px; }
.vs-dashboard { gap: 10px; }
.vs-hero { padding: 2px 0 10px; }
.vs-dashboard .vs-hero h2 { font: 600 30px/38px var(--dsw-font-family); margin: 2px 0 5px; }
.vs-hero p { font: var(--dsw-font-xs-13); line-height: 1.55; }
.vs-hero-search { height: 42px; margin-top: 10px; }
.vs-suggestions { margin-top: 8px; }
.vs-orbit { width: 250px; height: 190px; margin-right: 0; }
.vs-orbit-ring.r1 { width: 64px; height: 64px; }
.vs-orbit-ring.r2 { width: 118px; height: 118px; }
.vs-orbit-ring.r3 { width: 178px; height: 178px; }
.vs-orbit-core { width: 64px; height: 64px; box-shadow: 0 0 0 6px color-mix(in srgb, var(--vs-violet) 12%, transparent); }
.vs-orbit-core b { font: 600 22px/24px var(--dsw-font-family); }
.vs-orbit-core span { font: var(--dsw-font-xxxs-11); }
.vs-orbit-chip { font: var(--dsw-font-xxxs-11); padding: 3px 7px; }
.vs-access-pill { height: 28px; display: inline-flex; align-items: center; gap: 6px; padding: 0 9px; border: 1px solid var(--vs-line); border-radius: 20px; background: var(--vs-card); color: var(--vs-muted); font: var(--dsw-font-xxxs-11); cursor: pointer; white-space: nowrap; }
.vs-access-pill.on { color: var(--vs-green); border-color: color-mix(in srgb, var(--vs-green) 40%, var(--vs-line)); background: color-mix(in srgb, var(--vs-green) 5%, var(--vs-card)); }
.vs-access-pill.off { color: var(--vs-warn); border-color: color-mix(in srgb, var(--vs-warn) 35%, var(--vs-line)); background: color-mix(in srgb, var(--vs-warn) 5%, var(--vs-card)); }
.vs-access-pill:hover { background: var(--vs-card2); }
.vs-inline-hint { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 3px 8px; border: 1px solid color-mix(in srgb, var(--vs-violet) 24%, var(--vs-line)); border-radius: 20px; background: color-mix(in srgb, var(--vs-violet) 5%, transparent); color: var(--vs-muted); font: var(--dsw-font-xxxs-11); cursor: pointer; }
.vs-inline-hint:hover { color: var(--vs-fg); background: var(--vs-card2); }
.vs-inline-hint svg:last-child { color: var(--vs-soft); }
.vs-stat-grid .vs-card { padding: 10px 12px; }
.vs-stat-grid .vs-stat-value { font: 600 26px/30px var(--dsw-font-family); }
.vs-stat-grid .vs-stat-label { font: var(--dsw-font-xxxs-11); }
.vs-stat-grid .vs-stat-foot { font: var(--dsw-font-xxxs-11); margin-top: 4px; }
.vs-dash-grid { gap: 10px; }
.vs-github { display: flex; align-items: center; gap: 13px; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--vs-violet) 26%, var(--vs-line)); border-radius: 10px; background: linear-gradient(100deg, color-mix(in srgb, var(--vs-violet) 8%, var(--vs-card)), var(--vs-card) 62%); text-decoration: none; color: inherit; transition: .16s; }
.vs-github:hover { border-color: color-mix(in srgb, var(--vs-violet) 52%, var(--vs-line)); background: linear-gradient(100deg, color-mix(in srgb, var(--vs-violet) 12%, var(--vs-card)), var(--vs-card) 62%); }
.vs-github-mark { width: 40px; height: 40px; flex: none; border-radius: 10px; display: grid; place-items: center; background: var(--vs-fg); color: var(--vs-bg); box-shadow: 0 10px 24px -16px color-mix(in srgb, var(--vs-fg) 70%, transparent); }
.vs-github-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.vs-github-copy b { font: 600 14px/19px var(--dsw-font-family); }
.vs-github-copy > span { color: var(--vs-muted); font: var(--dsw-font-xxs-12); line-height: 1.5; }
.vs-github-side { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.vs-github-repo { color: var(--vs-soft); font: var(--dsw-font-xxxs-11); letter-spacing: .01em; }
.vs-github-cta { height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 0 11px; border-radius: 7px; background: var(--vs-fg); color: var(--vs-bg); font: var(--dsw-font-xxs-12); white-space: nowrap; }
.vs-github-cta svg:first-child { color: #f5c451; }
.vs-github:hover .vs-github-cta { opacity: .9; }
@media (max-width: 760px) { .vs-github { align-items: flex-start; flex-wrap: wrap; } .vs-github-copy { flex-basis: calc(100% - 53px); } .vs-github-side { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; padding-left: 53px; } }
@media (max-width: 1180px) { .vs-dash-grid > .vs-span-7, .vs-dash-grid > .vs-span-5 { grid-column: span 12; } .vs-orbit { width: 230px; height: 178px; } }
@media (max-width: 1180px) { .vs-dash-grid > .vs-span-7, .vs-dash-grid > .vs-span-5 { grid-column: span 12; } .vs-orbit { width: 260px; height: 210px; } }
@media (max-width: 900px) { .vs-hero { align-items: flex-start; flex-direction: column; } .vs-orbit { display: none; } .vs-dashboard .vs-hero h2 { font-size: 27px; line-height: 34px; } .vs-head-actions { gap: 6px; } .vs-topline { align-items: flex-start; flex-direction: column; } .vs-topline-path { max-width: 100%; } }
@media (max-width: 760px) { .vs-hero-search { height: 42px; } .vs-hero-search-button { padding: 0 9px; } .vs-hint { align-items: flex-start; flex-wrap: wrap; } .vs-hint .vs-btn { margin-left: 27px; } .vs-access { align-items: flex-start; flex-wrap: wrap; } .vs-access-copy { flex-basis: calc(100% - 40px); } .vs-access-switch { margin-left: 29px; } .vs-chart-svg { height: 170px; } .vs-constellation-svg { height: 180px; } }
`;

    function Icon({ name, size = 14 }) {
      const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
      const paths = {
        brain: [h("path", { key: "a", d: "M9.5 4.2a2.7 2.7 0 0 0-4.3 2.2A2.8 2.8 0 0 0 3.5 11a2.8 2.8 0 0 0 1.7 4.9 2.8 2.8 0 0 0 4.3 2.2M14.5 4.2a2.7 2.7 0 0 1 4.3 2.2 2.8 2.8 0 0 1 1.7 4.6 2.8 2.8 0 0 1-1.7 4.9 2.8 2.8 0 0 1-4.3 2.2M9.5 4.2v15.1M14.5 4.2v15.1" })],
        grid: [h("rect", { key: "a", x: 3.5, y: 3.5, width: 7, height: 7, rx: 1.5 }), h("rect", { key: "b", x: 13.5, y: 3.5, width: 7, height: 7, rx: 1.5 }), h("rect", { key: "c", x: 3.5, y: 13.5, width: 7, height: 7, rx: 1.5 }), h("rect", { key: "d", x: 13.5, y: 13.5, width: 7, height: 7, rx: 1.5 })],
        search: [h("circle", { key: "a", cx: 10.8, cy: 10.8, r: 6.2 }), h("path", { key: "b", d: "m16 16 4.3 4.3" })],
        notes: [h("path", { key: "a", d: "M6 3.5h8.5L19 8v12.5H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5Z" }), h("path", { key: "b", d: "M14 3.8V8h4.2M8.5 12h7M8.5 15.5h5" })],
        settings: [h("circle", { key: "a", cx: 12, cy: 12, r: 3 }), h("path", { key: "b", d: "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.7v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.7h.08A1.7 1.7 0 0 0 7.64 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.9-1.9.06.06A1.7 1.7 0 0 0 11.08 6.6 1.7 1.7 0 0 0 12.1 5.04V5h2.7v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06A1.7 1.7 0 0 0 19.27 10a1.7 1.7 0 0 0 1.56 1.03H21v2.7h-.08A1.7 1.7 0 0 0 19.4 15Z" })],
        refresh: [h("path", { key: "a", d: "M19 8.5A7.5 7.5 0 1 0 19.4 14M19 4v4.5h-4.5" })],
        plus: [h("path", { key: "a", d: "M12 5v14M5 12h14" })],
        copy: [h("rect", { key: "a", x: 8, y: 8, width: 11, height: 11, rx: 1.5 }), h("path", { key: "b", d: "M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" })],
        x: [h("path", { key: "a", d: "m6 6 12 12M18 6 6 18" })],
        arrow: [h("path", { key: "a", d: "M5 12h13M13 6l6 6-6 6" })],
        file: [h("path", { key: "a", d: "M6 3.5h8.5L19 8v12.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5Z" }), h("path", { key: "b", d: "M14 3.8V8h4.2" })],
        spark: [h("path", { key: "a", d: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" }), h("path", { key: "b", d: "M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" })],
        star: [h("path", { key: "a", d: "M12 3.6l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.9L12 3.6Z" })],
        github: [h("path", { key: "a", fill: "currentColor", stroke: "none", d: "M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" })],
        link: [h("path", { key: "a", d: "M10 13.8a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.3 1.3M14 10.2a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.3-1.3" })],
        alert: [h("path", { key: "a", d: "M12 3 2.8 19h18.4L12 3Z" }), h("path", { key: "b", d: "M12 9v4M12 16.5v.1" })],
        check: [h("path", { key: "a", d: "m5 12.5 4.2 4.2L19 6.8" })],
        shield: [h("path", { key: "a", d: "M12 3 20 6v5.5c0 4.4-3.2 7.7-8 9.5-4.8-1.8-8-5.1-8-9.5V6l8-3Z" }), h("path", { key: "b", d: "M9 11.8 11.2 14l3.8-4" })]
      };
      return h("svg", p, paths[name] ?? paths.grid);
    }

    function PanelIcon({ size = 18 }) {
      return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
        h("path", { d: "M12 2.8 20 7.5v9L12 21.2 4 16.5v-9L12 2.8Z", stroke: "currentColor", strokeWidth: 1.4 }),
        h("path", { d: "M12 8.1 16 10.4v4.2L12 16.9 8 14.6v-4.2L12 8.1Z", fill: "currentColor", opacity: .55 }),
        h("circle", { cx: 12, cy: 2.8, r: 1.3, fill: "currentColor" }),
        h("circle", { cx: 20, cy: 7.5, r: 1.3, fill: "currentColor" }),
        h("circle", { cx: 20, cy: 16.5, r: 1.3, fill: "currentColor" }),
        h("circle", { cx: 12, cy: 21.2, r: 1.3, fill: "currentColor" }),
        h("circle", { cx: 4, cy: 16.5, r: 1.3, fill: "currentColor" }),
        h("circle", { cx: 4, cy: 7.5, r: 1.3, fill: "currentColor" }));
    }

    let activeLocale = "";

    function lang() {
      // DSH owns the UI language. `navigator.language` can be English even when
      // the Harness itself is set to Chinese, so prefer the locale service's
      // active language and the document language it synchronizes.
      const documentLanguage = typeof document !== "undefined" ? String(document.documentElement?.lang || "") : "";
      const browserLanguage = typeof navigator !== "undefined" ? String(navigator.language || "") : "";
      const candidate = String(activeLocale || documentLanguage || browserLanguage);
      return candidate.toLowerCase().startsWith("zh") ? "zh" : "en";
    }

    function makeT(props) {
      const language = lang();
      const dictionary = DICT[language];
      return (key, values = {}) => {
        // Prefer the plugin's own template: the host translator uses a
        // different placeholder dialect and can leave "{count}" fragments.
        let value = dictionary[key] ?? DICT.en[key];
        if (!value) {
          try {
            value = props.t ? props.t(key, values) : key;
          } catch {
            value = key;
          }
        }
        return String(value).replace(/\{\{(\w+)\}\}/g, (_, name) => values[name] ?? `{{${name}}}`);
      };
    }

    function formatNumber(value) {
      return new Intl.NumberFormat(lang() === "zh" ? "zh-CN" : "en-US").format(Number(value) || 0);
    }

    function formatDate(value) {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat(lang() === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
    }

    function formatWords(value) {
      const number = Number(value) || 0;
      return number >= 1_000_000 ? `${(number / 1_000_000).toFixed(2)}M` : number >= 1000 ? `${(number / 1000).toFixed(1)}k` : String(number);
    }

    function estimateTokens(results) {
      return results.reduce((sum, result) => sum + Math.max(80, Math.ceil((result.snippet?.length ?? 0) / 2.2)), 0);
    }

    function Button({ children, icon, primary, danger, onClick, disabled, title, className = "", state = "idle" }) {
      const loading = state === "loading";
      return h("button", {
        type: "button",
        className: `vs-btn${primary ? " primary" : ""}${danger ? " danger" : ""}${state === "success" ? " success" : ""}${className ? ` ${className}` : ""}`,
        onClick,
        disabled: disabled || loading,
        title,
        "aria-busy": loading ? "true" : undefined
      },
        loading ? h("span", { className: "vs-spinner", "aria-hidden": "true" }) : (icon || state === "success" ? h(Icon, { name: state === "success" ? "check" : icon }) : null),
        h("span", null, children));
    }

    function StatCard({ label, value, suffix, foot, icon }) {
      return h("div", { className: "vs-card" },
        h("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } },
          h("span", { className: "vs-stat-label" }, label),
          icon ? h(Icon, { name: icon, size: 13 }) : null),
        h("div", { className: "vs-stat-value" }, formatNumber(value), suffix ? h("small", null, suffix) : null),
        foot ? h("div", { className: "vs-stat-foot" }, foot) : null);
    }

    function Notice({ notice, onClose }) {
      if (!notice) return null;
      return h("div", { className: `vs-notice${notice.error ? " error" : ""}`, role: "status" },
        h("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } },
          h(Icon, { name: notice.error ? "alert" : "check", size: 13 }),
          h("div", { style: { flex: 1 } }, notice.message)),
        h("button", { type: "button", className: "vs-remove", onClick: onClose, "aria-label": "close" }, "×"));
    }

    function SetupView({ t, settings, api, onDone, notify }) {
      const [path, setPath] = useState(settings?.vaultPath || "");
      const [busy, setBusy] = useState(false);
      const connect = async () => {
        if (!path.trim()) return;
        setBusy(true);
        try {
          await api.call("updateSettings", { vaultPath: path.trim() });
          notify(t("settings.saved"));
          await onDone();
        } catch (error) {
          notify(`${t("error.prefix")}${error.message}`, true);
        } finally {
          setBusy(false);
        }
      };
      return h("div", { className: "vs-card", style: { maxWidth: 620, margin: "36px auto", padding: 24 } },
        h(Icon, { name: "brain", size: 25 }),
        h("h2", { className: "vs-title", style: { fontSize: 27, marginTop: 12 } }, t("setup.title")),
        h("p", { className: "vs-sub", style: { marginBottom: 16 } }, t("setup.body")),
        h("label", { className: "vs-field-label", style: { display: "block", marginBottom: 5 } }, t("setup.path")),
        h("input", { className: "vs-input", value: path, placeholder: "~/Vaults/second-brain", onChange: (event) => setPath(event.target.value) }),
        h("div", { className: "vs-actions-right" }, h(Button, { primary: true, icon: "arrow", onClick: connect, state: busy ? "loading" : "idle" }, t("setup.button"))),
        h("p", { className: "vs-muted", style: { marginTop: 12 } }, t("settings.privacy")));
    }

    function smoothPath(points) {
      if (!points.length) return "";
      if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let index = 0; index < points.length - 1; index += 1) {
        const p0 = points[index - 1] ?? points[index];
        const p1 = points[index];
        const p2 = points[index + 1];
        const p3 = points[index + 2] ?? p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
      }
      return path;
    }

    function ActivityChart({ activity, t }) {
      const points = Array.isArray(activity) && activity.length ? activity : [];
      const max = Math.max(1, ...points.map((point) => point.count));
      const width = 640;
      const height = 190;
      const left = 6;
      const right = 6;
      const top = 14;
      const bottom = 30;
      const plotWidth = width - left - right;
      const plotHeight = height - top - bottom;
      const coordinates = points.map((point, index) => ({
        x: left + (index / Math.max(1, points.length - 1)) * plotWidth,
        y: top + plotHeight - (point.count / max) * plotHeight,
        point
      }));
      const line = smoothPath(coordinates);
      const area = coordinates.length
        ? `${line} L ${coordinates[coordinates.length - 1].x} ${top + plotHeight} L ${coordinates[0].x} ${top + plotHeight} Z`
        : "";
      return h("div", { className: "vs-chart" },
        h("svg", { className: "vs-chart-svg", viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": t("dashboard.activity") },
          h("defs", null,
            h("linearGradient", { id: "vs-activity-fill", x1: "0", x2: "0", y1: "0", y2: "1" },
              h("stop", { offset: "0%", stopColor: "var(--vs-violet)", stopOpacity: ".28" }),
              h("stop", { offset: "100%", stopColor: "var(--vs-violet)", stopOpacity: "0" }))),
          [0, 1, 2, 3].map((row) => h("line", {
            key: `grid-${row}`,
            x1: left,
            x2: width - right,
            y1: top + (plotHeight / 3) * row,
            y2: top + (plotHeight / 3) * row,
            className: "vs-chart-grid"
          })),
          area ? h("path", { d: area, fill: "url(#vs-activity-fill)" }) : null,
          coordinates.length ? h("path", { d: line, className: "vs-chart-line" }) : null,
          coordinates.map((item, index) => h("circle", {
            key: item.point.date,
            cx: item.x,
            cy: item.y,
            r: item.point.count ? 3.2 : 2,
            className: "vs-chart-dot"
          })),
          coordinates.map((item, index) => index % 2 === 0 ? h("text", {
            key: `label-${item.point.date}`,
            x: item.x,
            y: height - 8,
            className: "vs-chart-label",
            textAnchor: "middle"
          }, item.point.date.slice(5)) : null)),
        h("div", { className: "vs-chart-legend" },
          h("span", null, h("i", { className: "vs-chart-swatch" }), `${formatNumber(points.reduce((sum, point) => sum + point.count, 0))} ${t("dashboard.edits")}`),
          h("span", null, `${formatNumber(max)} ${t("dashboard.peakLabel")}`)));
    }

    function VaultOrbit({ stats, t }) {
      const tags = (stats.tags || []).slice(0, 4);
      const chips = tags.length
        ? tags.map((tag) => ({ label: tag.name, count: tag.count }))
        : [{ label: t("search.keyword"), count: stats.totalNotes }];
      return h("div", { className: "vs-orbit", "aria-hidden": true },
        h("div", { className: "vs-orbit-ring r1" }),
        h("div", { className: "vs-orbit-ring r2" }),
        h("div", { className: "vs-orbit-ring r3" }),
        h("div", { className: "vs-orbit-core" },
          h("b", null, formatNumber(stats.totalNotes)),
          h("span", null, t("stats.notes"))),
        chips.map((chip, index) => h("span", { className: `vs-orbit-chip c${index + 1}`, key: chip.label }, chip.label)));
    }

    function TagConstellation({ tags, t, onSearch }) {
      const list = (tags || []).slice(0, 6);
      if (!list.length) return h("div", { className: "vs-empty vs-constellation-empty" }, h(Icon, { name: "link" }), t("dashboard.noTags"));
      const width = 420;
      const height = 220;
      const centerX = width / 2;
      const centerY = height / 2 - 2;
      const max = Math.max(...list.map((tag) => tag.count));
      const nodes = list.map((tag, index) => {
        const angle = -Math.PI / 2 + (index / list.length) * Math.PI * 2;
        const radius = 66 + (index % 2) * 20;
        return {
          tag,
          x: centerX + Math.cos(angle) * radius * 1.35,
          y: centerY + Math.sin(angle) * radius,
          radius: 4 + (tag.count / max) * 5
        };
      });
      return h("div", { className: "vs-constellation" },
        h("svg", { className: "vs-constellation-svg", viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": t("dashboard.graph") },
          nodes.map((node) => h("line", { key: `edge-${node.tag.name}`, x1: centerX, y1: centerY, x2: node.x, y2: node.y, className: "vs-constellation-edge" })),
          h("circle", { cx: centerX, cy: centerY, r: 27, className: "vs-constellation-center" }),
          h("text", { x: centerX, y: centerY - 2, className: "vs-constellation-center-label", textAnchor: "middle" }, t("dashboard.vaultLabel")),
          h("text", { x: centerX, y: centerY + 12, className: "vs-constellation-center-count", textAnchor: "middle" }, formatNumber(statsTotal(list))),
          nodes.map((node) => h("g", { key: node.tag.name, className: "vs-constellation-node", onClick: () => onSearch(node.tag.name) },
            h("circle", { cx: node.x, cy: node.y, r: node.radius }),
            h("text", { x: node.x, y: node.y + node.radius + 14, textAnchor: "middle" }, node.tag.name.slice(0, 14))))),
        h("div", { className: "vs-constellation-legend" },
          h("span", null, h("i", { className: "vs-dot violet" }), t("dashboard.tags")),
          h("span", null, `${formatNumber(list.reduce((sum, tag) => sum + tag.count, 0))} ${t("dashboard.references")}`)));
    }

    function statsTotal(tags) {
      return tags.reduce((sum, tag) => sum + tag.count, 0);
    }

    function Heatmap({ days, t }) {
      const source = Array.isArray(days) ? days : [];
      if (!source.length) return h("div", { className: "vs-empty vs-heatmap-empty" }, t("heatmap.empty"));
      const first = new Date(`${source[0].date}T00:00:00`);
      const leading = Number.isNaN(first.getTime()) ? 0 : first.getDay();
      const cells = [...Array(leading).fill(null), ...source];
      const weeks = [];
      for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
      return h("div", { className: "vs-heatmap" },
        h("div", { className: "vs-heatmap-scroll" },
          h("div", { className: "vs-heatmap-weeks" }, weeks.map((week, weekIndex) =>
            h("div", { className: "vs-heatmap-week", key: `week-${weekIndex}` },
              week.map((day, dayIndex) => day
                ? h("i", {
                  key: day.date,
                  className: `vs-heatmap-cell level-${day.level}`,
                  title: `${day.date}: ${day.count}`
                })
                : h("i", { key: `empty-${weekIndex}-${dayIndex}`, className: "vs-heatmap-cell empty" })))))),
        h("div", { className: "vs-heatmap-legend" },
          h("span", null, t("heatmap.less")),
          [0, 1, 2, 3, 4].map((level) => h("i", { key: level, className: `vs-heatmap-cell level-${level}` })),
          h("span", null, t("heatmap.more"))));
    }

    function summarizeHeatmap(days) {
      let active = 0;
      let total = 0;
      let longest = 0;
      let running = 0;
      for (const day of days) {
        if (day.count > 0) {
          active += 1;
          total += day.count;
          running += 1;
          longest = Math.max(longest, running);
        } else {
          running = 0;
        }
      }
      let current = 0;
      for (let index = days.length - 1; index >= 0; index -= 1) {
        if (days[index].count === 0) break;
        current += 1;
      }
      return { active, total, longest, current };
    }

    function UsageCard({ usage, t }) {
      const data = usage || { total: 0, byTool: [], today: 0, month: 0, last30: 0, daily: [], monthly: [] };
      const daily = Array.isArray(data.daily) ? data.daily : [];
      const monthly = Array.isArray(data.monthly) ? data.monthly : [];
      const byTool = Array.isArray(data.byTool) ? data.byTool : [];
      const max = Math.max(1, ...daily.map((day) => day.count));
      return h("div", { className: "vs-card vs-span-5" },
        h("div", { className: "vs-card-head" },
          h("div", null,
            h("div", { className: "vs-card-title" }, t("usage.title")),
            h("div", { className: "vs-card-sub" }, t("usage.sub"))),
          h("span", { className: "vs-badge" }, `${formatNumber(data.total || 0)} ${t("usage.calls")}`)),
        data.total
          ? h("div", { className: "vs-usage" },
            h("div", { className: "vs-usage-total" },
              h("b", null, formatNumber(data.total)),
              h("span", null, t("usage.total"))),
            h("div", { className: "vs-usage-kpis" },
              h("div", { className: "vs-usage-kpi" }, h("b", null, formatNumber(data.today || 0)), h("span", null, t("usage.today"))),
              h("div", { className: "vs-usage-kpi" }, h("b", null, formatNumber(data.month || 0)), h("span", null, t("usage.month"))),
              h("div", { className: "vs-usage-kpi" }, h("b", null, formatNumber(data.last30 || 0)), h("span", null, t("usage.last30")))),
            h("div", { className: "vs-usage-section-head" }, h("span", null, t("usage.daily")), h("em", null, t("usage.days14"))),
            h("div", { className: "vs-usage-bars" }, daily.map((day) =>
              h("div", { className: "vs-usage-bar", key: day.date, title: `${day.date}: ${day.count}` },
                h("i", { style: { height: `${Math.max(3, (day.count / max) * 100)}%` } })))),
            h("div", { className: "vs-usage-section-head" }, h("span", null, t("usage.monthly")), h("em", null, t("usage.months6"))),
            h("div", { className: "vs-usage-months" }, monthly.map((month) =>
              h("div", { className: "vs-usage-month", key: month.month },
                h("b", null, formatNumber(month.count)),
                h("span", null, month.month.slice(2))))),
            byTool.length ? h("div", { className: "vs-usage-tools" }, byTool.slice(0, 4).map((tool) =>
              h("span", { key: tool.name }, `${tool.name.replace(/^obsidian_/, "")} ${formatNumber(tool.count)}`))) : null)
          : h("div", { className: "vs-empty vs-usage-empty" }, h(Icon, { name: "spark" }), t("usage.empty")));
    }

    function QuickControls({ t, stats, settings, onToggleConversation, onQuickUpdate, onOpenSettings }) {
      const conversationEnabled = Boolean(settings?.conversationEnabled);
      const mode = settings?.indexMode || stats?.indexMode || "keyword";
      const watch = Boolean(settings?.watch);
      const toggle = (on, next) => h("button", {
        type: "button",
        className: `vs-quick-toggle${on ? " on" : ""}`,
        role: "switch",
        "aria-checked": String(on),
        onClick: next
      }, h("i", null));
      return h("aside", { className: "vs-quick" },
        h("div", { className: "vs-quick-head" },
          h("div", null,
            h("div", { className: "vs-kicker" }, t("quick.kicker")),
            h("div", { className: "vs-quick-title" }, t("quick.title"))),
          h("span", { className: `vs-badge ${conversationEnabled ? "ok" : "work"}` }, conversationEnabled ? t("access.on") : t("access.off"))),
        h("div", { className: "vs-quick-row" },
          h("span", { className: "vs-quick-icon" }, h(Icon, { name: "shield", size: 15 })),
          h("div", { className: "vs-quick-copy" },
            h("b", null, t("access.title")),
            h("span", null, conversationEnabled ? t("access.shortOn") : t("access.shortOff"))),
          toggle(conversationEnabled, onToggleConversation)),
        h("div", { className: "vs-quick-row" },
          h("span", { className: "vs-quick-icon" }, h(Icon, { name: "search", size: 15 })),
          h("div", { className: "vs-quick-copy" },
            h("b", null, t("quick.mode")),
            h("span", null, t("quick.modeHint"))),
          h("select", {
            className: "vs-quick-select",
            value: mode,
            "aria-label": t("quick.mode"),
            onChange: (event) => onQuickUpdate({ indexMode: event.target.value })
          },
            h("option", { value: "keyword" }, t("search.keyword")),
            h("option", { value: "hybrid" }, t("search.hybrid")),
            h("option", { value: "semantic" }, t("search.semantic")))),
        h("div", { className: "vs-quick-row" },
          h("span", { className: "vs-quick-icon" }, h(Icon, { name: "refresh", size: 15 })),
          h("div", { className: "vs-quick-copy" },
            h("b", null, t("quick.watch")),
            h("span", null, t("quick.watchHint"))),
          toggle(watch, () => onQuickUpdate({ watch: !watch }))),
        h("button", { type: "button", className: "vs-quick-footer", onClick: onOpenSettings },
          h(Icon, { name: "settings", size: 12 }),
          t("quick.settings"),
          h(Icon, { name: "arrow", size: 11 })));
    }

    function Dashboard({ stats, t, settings, onReindex, onOpenSearch, onOpenSettings, onOpenNote, onOpenNotes, onToggleConversation, onQuickUpdate }) {
      const [heroQuery, setHeroQuery] = useState("");
      if (!stats) return null;
      const maxFolder = Math.max(1, ...(stats.folders || []).map((folder) => folder.count));
      const suggestions = (stats.tags || []).slice(0, 3).map((tag) => tag.name);
      if (!suggestions.length) suggestions.push(t("search.keyword"), t("stats.notes"), t("dashboard.recent"));
      const submit = () => onOpenSearch(heroQuery.trim());
      return h("div", { className: "vs-dashboard" },
        h("div", { className: "vs-hero" },
          h("div", { className: "vs-hero-copy" },
            h("div", { className: "vs-kicker" }, t("dashboard.kicker")),
            h("h2", null, t("dashboard.heroTitle")),
            h("p", null, t("dashboard.heroBody")),
            h("div", { className: "vs-hero-search" },
              h(Icon, { name: "search", size: 17 }),
              h("input", {
                value: heroQuery,
                placeholder: t("dashboard.heroPlaceholder"),
                onChange: (event) => setHeroQuery(event.target.value),
                onKeyDown: (event) => { if (event.key === "Enter") submit(); }
              }),
              h("button", { type: "button", className: "vs-hero-search-button", onClick: submit }, t("search.button")),
              h("span", { className: "vs-hero-enter" }, "↵")),
            h("div", { className: "vs-suggestions" },
              h("span", { className: "vs-suggestions-label" }, t("dashboard.try")),
              suggestions.map((suggestion) => h("button", {
                type: "button",
                className: "vs-suggest",
                key: suggestion,
                onClick: () => onOpenSearch(suggestion)
              }, suggestion))),
            stats.error ? h("div", { className: "vs-badge bad", style: { marginTop: 12, whiteSpace: "normal" } }, h(Icon, { name: "alert", size: 11 }), stats.error) : null),
          h(QuickControls, { t, stats, settings, onToggleConversation, onQuickUpdate, onOpenSettings })),
        h("div", { className: "vs-grid vs-grid-5 vs-stat-grid" },
          h(StatCard, { label: t("stats.notes"), value: stats.totalNotes, icon: "notes", foot: `${formatWords(stats.totalWords)} ${t("stats.words")}` }),
          h(StatCard, { label: t("stats.words"), value: stats.totalWords, suffix: t("stats.words"), icon: "file", foot: `${stats.totalNotes ? Math.round(stats.totalWords / stats.totalNotes) : 0} ${t("dashboard.avg")}` }),
          h(StatCard, { label: t("stats.tags"), value: stats.totalTags, icon: "link", foot: `${(stats.tags || []).slice(0, 2).map((tag) => tag.name).join(" · ") || "—"}` }),
          h(StatCard, { label: t("stats.week"), value: stats.composition?.updatedLast7 ?? 0, icon: "refresh", foot: t("stats.weekFoot") }),
          h(StatCard, { label: t("stats.chunks"), value: stats.totalChunks, icon: "grid", foot: t(`search.${stats.indexMode || "keyword"}`) })),
        h("a", {
          className: "vs-github",
          href: REPO_URL,
          target: "_blank",
          rel: "noreferrer noopener",
          "aria-label": t("github.aria")
        },
          h("span", { className: "vs-github-mark" }, h(Icon, { name: "github", size: 21 })),
          h("div", { className: "vs-github-copy" },
            h("div", { className: "vs-kicker" }, t("github.kicker")),
            h("b", null, t("github.title")),
            h("span", null, t("github.body"))),
          h("span", { className: "vs-github-side" },
            h("span", { className: "vs-github-repo" }, t("github.repo")),
            h("span", { className: "vs-github-cta" },
              h(Icon, { name: "star", size: 13 }),
              t("github.cta"),
              h(Icon, { name: "arrow", size: 12 })))),
        (stats.heatmap || []).length
          ? (() => {
            const summary = summarizeHeatmap(stats.heatmap || []);
            return h("div", { className: "vs-card vs-heatmap-card" },
              h("div", { className: "vs-card-head" },
                h("div", null,
                  h("div", { className: "vs-card-title" }, t("heatmap.title")),
                  h("div", { className: "vs-card-sub" }, t("heatmap.sub"))),
                h("span", { className: "vs-badge" }, t("heatmap.badge", { count: summary.active }))),
              h("div", { className: "vs-heatmap-layout" },
                h(Heatmap, { days: stats.heatmap, t }),
                h("div", { className: "vs-heatmap-summary" },
                  h("div", { className: "vs-heatmap-stat" }, h("b", null, formatNumber(summary.active)), h("span", null, t("heatmap.activeDays"))),
                  h("div", { className: "vs-heatmap-stat" }, h("b", null, formatNumber(summary.total)), h("span", null, t("heatmap.edits"))),
                  h("div", { className: "vs-heatmap-stat" }, h("b", null, formatNumber(summary.current)), h("span", null, t("heatmap.currentStreak"))),
                  h("div", { className: "vs-heatmap-stat" }, h("b", null, formatNumber(summary.longest)), h("span", null, t("heatmap.longestStreak"))))));
          })() : null,
        h("div", { className: "vs-dash-grid" },
          h("div", { className: "vs-card vs-span-7" },
            h("div", { className: "vs-card-head" },
              h("div", null, h("div", { className: "vs-card-title" }, t("dashboard.activity")), h("div", { className: "vs-card-sub" }, t("dashboard.notesWords", { notes: formatNumber(stats.totalNotes), words: formatWords(stats.totalWords) }))),
              h("span", { className: "vs-badge" }, t("dashboard.peak", { max: Math.max(0, ...(stats.activity || []).map((point) => point.count)), mode: t(`search.${stats.indexMode || "keyword"}`) }))),
            h(ActivityChart, { activity: stats.activity, t })),
          h(UsageCard, { usage: stats.usage, t }),
          h("div", { className: "vs-card vs-span-7" },
            h("div", { className: "vs-card-head" },
              h("div", null, h("div", { className: "vs-card-title" }, t("dashboard.recent")), h("div", { className: "vs-card-sub" }, t("dashboard.recentSub"))),
              h(Button, { icon: "notes", onClick: onOpenNotes }, t("tab.notes"))),
            (stats.recent || []).length
              ? h("div", { className: "vs-list" }, stats.recent.slice(0, 6).map((note, index) =>
                h("div", { className: "vs-row vs-recent-row", key: note.path, onClick: () => onOpenNote(note.path) },
                  h("span", { className: "vs-recent-index" }, String(index + 1).padStart(2, "0")),
                  h("span", { className: "vs-recent-icon" }, h(Icon, { name: "file", size: 13 })),
                  h("div", { className: "vs-row-main" },
                    h("div", { className: "vs-row-title" }, note.title),
                    h("div", { className: "vs-row-meta" }, `${note.path} · ${(note.tags || []).slice(0, 2).join(" / ") || t("dashboard.noTags")}`)),
                  h("div", { className: "vs-row-side" }, formatDate(note.mtime)))))
              : h("div", { className: "vs-empty" }, t("dashboard.empty"))),
          h("div", { className: "vs-card vs-span-5" },
            h("div", { className: "vs-card-head" },
              h("div", null, h("div", { className: "vs-card-title" }, t("dashboard.graph")), h("div", { className: "vs-card-sub" }, t("dashboard.graphSub"))),
              h("span", { className: "vs-badge" }, `${formatNumber(stats.totalTags)} ${t("stats.tags")}`)),
            h(TagConstellation, { tags: stats.tags, t, onSearch: onOpenSearch }),
            h("div", { className: "vs-folder-list" },
              (stats.folders || []).slice(0, 4).map((folder) =>
                h("div", { className: "vs-folder-row", key: folder.name },
                  h("span", null, folder.name),
                  h("i", null, h("b", { style: { width: `${Math.max(4, (folder.count / maxFolder) * 100)}%` } })),
                  h("em", null, formatNumber(folder.count)))))),
        stats.totalNotes === 0 ? h("div", { className: "vs-empty", style: { marginTop: 4 } }, h(Icon, { name: "notes" }), t("dashboard.empty")) : null));
    }

    function SearchView({ t, api, onNotice, onOpenNote, stats, initialQuery = "" }) {
      const [query, setQuery] = useState(initialQuery || "");
      const mode = stats?.indexMode || "keyword";
      const [folder, setFolder] = useState("");
      const [tag, setTag] = useState("");
      const [results, setResults] = useState([]);
      const [selected, setSelected] = useState([]);
      const [meta, setMeta] = useState(null);
      const [busy, setBusy] = useState(false);
      const [copied, setCopied] = useState(false);
      const copyTimer = useRef(null);
      const searchSequence = useRef(0);
      const performSearch = async (notifyWarning = true) => {
        const text = query.trim();
        if (!text) {
          searchSequence.current += 1;
          setResults([]);
          setMeta(null);
          setBusy(false);
          return;
        }
        const sequence = ++searchSequence.current;
        setBusy(true);
        try {
          const response = await api.call("search", text, {
            mode,
            limit: 12,
            folders: folder ? [folder] : [],
            tags: tag ? [tag] : []
          });
          if (sequence !== searchSequence.current) return;
          setResults(response.results || []);
          setMeta(response);
          if (response.warning && notifyWarning) onNotice(response.warning);
        } catch (error) {
          if (sequence !== searchSequence.current) return;
          onNotice(`${t("error.prefix")}${error.message}`, true);
        } finally {
          if (sequence === searchSequence.current) setBusy(false);
        }
      };
      const search = (event) => {
        if (event) event.preventDefault();
        void performSearch(true);
      };
      useEffect(() => { setQuery(initialQuery || ""); }, [initialQuery]);
      useEffect(() => {
        if (!query.trim()) {
          searchSequence.current += 1;
          setResults([]);
          setMeta(null);
          setBusy(false);
          return;
        }
        const timer = setTimeout(() => { void performSearch(false); }, 240);
        return () => clearTimeout(timer);
      }, [query, folder, tag, mode, initialQuery]);
      const toggle = (result) => {
        setSelected((current) => current.some((item) => item.id === result.id)
          ? current.filter((item) => item.id !== result.id)
          : [...current, result]);
      };
      const copy = async () => {
        const body = selected.map((result, index) => {
          const heading = result.headingPath?.length ? `\nHeading: ${result.headingPath.join(" › ")}` : "";
          return `[${index + 1}] ${result.notePath}${heading}\n${result.snippet}`;
        }).join("\n\n");
        try {
          await navigator.clipboard.writeText(`# Obsidian context\n\n${body}`);
          setCopied(true);
          if (copyTimer.current) clearTimeout(copyTimer.current);
          copyTimer.current = setTimeout(() => setCopied(false), 1800);
          onNotice(t("context.copyDone"));
        } catch {
          setCopied(false);
          onNotice(t("error.clipboard"), true);
        }
      };
      useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
      return h("div", null,
        h("div", { className: "vs-hero", style: { paddingBottom: 14 } },
          h("div", null,
            h("div", { className: "vs-kicker" }, t("search.kicker")),
            h("h2", null, t("tab.search")),
            h("p", null, t("search.empty"))),
          h("div", { className: "vs-badge" }, `${meta?.total ?? results.length} ${lang() === "zh" ? "条结果" : "results"}`)),
        h("form", { className: "vs-searchbar", onSubmit: search },
          h("input", { className: "vs-input", value: query, onChange: (event) => setQuery(event.target.value), placeholder: t("search.placeholder"), autoFocus: true }),
          h(Button, { primary: true, icon: "search", onClick: search, state: busy ? "loading" : "idle" }, t("search.button"))),
        h("div", { className: "vs-search-controls" },
          h("div", { className: "vs-search-filters" },
            h("select", { className: "vs-select", value: folder, onChange: (event) => setFolder(event.target.value), title: t("search.folder") },
              h("option", { value: "" }, `${t("search.folder")}: ${t("search.all")}`),
              (stats?.folders || []).slice(0, 20).map((item) => h("option", { value: item.name, key: item.name }, item.name))),
            h("select", { className: "vs-select", value: tag, onChange: (event) => setTag(event.target.value), title: t("search.tag") },
              h("option", { value: "" }, `${t("search.tag")}: ${t("search.all")}`),
              (stats?.tags || []).slice(0, 20).map((item) => h("option", { value: item.name, key: item.name }, item.name)))),
          h("span", { className: "vs-muted" }, meta?.warning || `${meta?.total ?? results.length} ${lang() === "zh" ? "条结果" : "results"}`)),
        h("div", { className: "vs-results-layout" },
          h("div", { className: "vs-results" },
            results.length === 0
              ? h("div", { className: "vs-empty" }, h(Icon, { name: "search" }), t("search.empty"))
              : results.map((result) => {
                const active = selected.some((item) => item.id === result.id);
                return h("div", { className: `vs-result${active ? " selected" : ""}`, key: result.id },
                  h("div", { className: "vs-result-head" },
                    h("div", { style: { flex: 1, minWidth: 0 } },
                      h("h3", { className: "vs-result-title vs-clickable", onClick: () => onOpenNote(result.notePath) }, result.title),
                      h("div", { className: "vs-result-path" }, `${result.notePath}${result.headingPath?.length ? ` › ${result.headingPath.join(" › ")}` : ""}`)),
                    h("span", { className: "vs-score" }, Number(result.score).toFixed(2))),
                  h("p", { className: "vs-result-snippet" }, result.snippet),
                  h("div", { className: "vs-result-foot" },
                    h("div", { className: "vs-tags" }, (result.tags || []).slice(0, 3).map((tag) => h("span", { className: "vs-tag", key: tag }, tag))),
                    h("span", { className: "vs-result-path", style: { margin: 0 } }, (result.matchedBy || []).map((mode) => t(`search.${mode}`)).join(" + ")),
                    h("div", { style: { marginLeft: "auto" } }, h(Button, { icon: "plus", onClick: () => toggle(result) }, active ? t("search.added") : t("search.add")))));
              })),
          h("div", { className: "vs-card vs-context" },
            h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
              h("div", { className: "vs-card-title" }, t("context.title")),
              h("span", { className: "vs-badge" }, t("context.token", { count: estimateTokens(selected) }))),
            selected.length === 0
              ? h("div", { className: "vs-empty", style: { marginTop: 10 } }, h(Icon, { name: "link" }), t("context.empty"))
              : h("div", { style: { marginTop: 5 } }, selected.map((result, index) =>
                h("div", { className: "vs-context-item", key: result.id },
                  h("span", { className: "vs-context-index" }, String(index + 1).padStart(2, "0")),
                  h("div", { className: "vs-context-main" },
                    h("div", { className: "vs-context-title" }, result.title),
                    h("div", { className: "vs-context-path" }, `${result.notePath}${result.headingPath?.length ? ` › ${result.headingPath.join(" › ")}` : ""}`)),
                  h("button", { type: "button", className: "vs-remove", onClick: () => toggle(result), "aria-label": "remove" }, "×")))),
            h("div", { className: "vs-context-actions" },
              h(Button, {
                icon: "copy",
                onClick: copy,
                disabled: !selected.length,
                state: copied ? "success" : "idle"
              }, copied ? t("context.copied") : t("action.copy")),
              h(Button, { icon: "x", onClick: () => setSelected([]), disabled: !selected.length }, t("action.cancel"))))));
    }

    function NotesView({ t, api, onNotice, requestedPath, onRefreshStats }) {
      const [notes, setNotes] = useState([]);
      const [filter, setFilter] = useState("");
      const [active, setActive] = useState(null);
      const [writeDraft, setWriteDraft] = useState(null);
      const [busy, setBusy] = useState(false);
      const openRequested = useRef("");
      const noteSequence = useRef(0);

      const loadNotes = async () => {
        try {
          const list = await api.call("listNotes", { limit: 200 });
          setNotes(list);
          if (!active && list.length) void openNote(list[0].path);
          return list;
        } catch (error) {
          onNotice(`${t("error.prefix")}${error.message}`, true);
          return [];
        }
      };

      const openNote = async (path) => {
        if (!path) return;
        const sequence = ++noteSequence.current;
        setBusy(true);
        try {
          const note = await api.call("readNote", path);
          if (sequence !== noteSequence.current) return;
          setActive(note);
          openRequested.current = path;
        } catch (error) {
          if (sequence === noteSequence.current) onNotice(`${t("error.prefix")}${error.message}`, true);
        } finally {
          if (sequence === noteSequence.current) setBusy(false);
        }
      };

      useEffect(() => { void loadNotes(); }, []);
      useEffect(() => {
        if (requestedPath && requestedPath !== openRequested.current) void openNote(requestedPath);
      }, [requestedPath]);

      const filtered = useMemo(() => {
        const query = filter.trim().toLowerCase();
        if (!query) return notes;
        return notes.filter((note) => `${note.title} ${note.path} ${note.tags.join(" ")}`.toLowerCase().includes(query));
      }, [filter, notes]);

      const applyDone = async (result) => {
        const list = (await loadNotes()) || [];
        const activeStillExists = active && list.some((note) => note.path === active.path);
        const path = result?.path || (activeStillExists ? active.path : list[0]?.path);
        if (path) await openNote(path);
        onRefreshStats();
      };

      return h("div", null,
        h("div", { className: "vs-hero", style: { paddingBottom: 14 } },
          h("div", null,
            h("div", { className: "vs-kicker" }, t("notes.kicker")),
            h("h2", null, t("tab.notes")),
            h("p", null, t("notes.lead"))),
          h("div", { className: "vs-head-actions" },
            h(Button, { icon: "plus", primary: true, onClick: () => setWriteDraft({ operation: "create", targetPath: "", content: "", reason: "" }) }, t("action.newNote")),
            h(Button, { icon: "plus", disabled: !active, onClick: () => active && setWriteDraft({ operation: "append", targetPath: active.path, content: "", reason: "" }) }, t("action.append")))),
        h("div", { className: "vs-notes-layout" },
          h("div", { className: "vs-card" },
            h("input", { className: "vs-input", style: { height: 32, marginBottom: 8 }, value: filter, placeholder: t("notes.filter"), onChange: (event) => setFilter(event.target.value) }),
            h("div", { className: "vs-list" }, filtered.map((note) =>
              h("div", { className: `vs-note-row${active?.path === note.path ? " active" : ""}`, key: note.path, onClick: () => void openNote(note.path) },
                h(Icon, { name: "file", size: 12 }),
                h("div", { className: "vs-note-row-main" },
                  h("div", { className: "vs-note-row-title" }, note.title),
                  h("div", { className: "vs-note-row-path" }, note.path)),
                h("div", { className: "vs-row-side" }, formatNumber(note.words))))),
            filtered.length === 0 ? h("div", { className: "vs-empty" }, h(Icon, { name: "notes" }), t("notes.empty")) : null),
          h("div", { className: "vs-card" },
            active
              ? h("div", null,
                h("div", { className: "vs-kicker" }, active.path),
                h("h2", { style: { fontFamily: "var(--dsw-font-family, \"PingFang SC\", \"Microsoft YaHei\", sans-serif)", fontSize: 24, fontWeight: 500, letterSpacing: "-.025em", margin: "5px 0 8px" } }, active.title),
                h("div", { className: "vs-tags" }, active.tags.map((tag) => h("span", { className: "vs-tag", key: tag }, tag))),
                h("div", { className: "vs-note-actions" },
                  h(Button, { icon: "plus", onClick: () => setWriteDraft({ operation: "append", targetPath: active.path, content: "", reason: "" }) }, t("action.append"))),
                h("div", { className: "vs-muted", style: { display: "flex", gap: 14, marginBottom: 10 } },
                  h("span", null, `${formatNumber(active.words)} ${t("notes.words")}`),
                  h("span", null, `${t("notes.links")}: ${active.links.length}`),
                  h("span", null, `${t("notes.updated")} ${formatDate(active.mtime)}`)),
                h("div", { className: "vs-note-content" }, active.content),
                Object.keys(active.frontmatter || {}).length
                  ? h("details", { style: { marginTop: 14 } },
                    h("summary", { className: "vs-muted" }, t("notes.frontmatter")),
                    h("pre", { className: "vs-diff" }, JSON.stringify(active.frontmatter, null, 2)))
                  : null)
              : h("div", { className: "vs-empty" }, h(Icon, { name: "file" }), busy ? t("loading") : t("notes.select")))),
        writeDraft ? h(WriteModal, { t, api, draft: writeDraft, onClose: () => setWriteDraft(null), onNotice, onApplied: applyDone }) : null);
    }

    function WriteModal({ t, api, draft, onClose, onNotice, onApplied }) {
      const [form, setForm] = useState(draft);
      const [proposal, setProposal] = useState(null);
      const [undoId, setUndoId] = useState("");
      const [busy, setBusy] = useState(false);

      const propose = async () => {
        setBusy(true);
        try {
          const result = await api.call("proposeWrite", {
            operation: form.operation,
            targetPath: form.targetPath,
            content: form.content,
            reason: form.reason
          });
          setProposal(result);
        } catch (error) {
          onNotice(`${t("error.prefix")}${error.message}`, true);
        } finally {
          setBusy(false);
        }
      };
      const apply = async () => {
        setBusy(true);
        try {
          const result = await api.call("applyWrite", proposal.id);
          setUndoId(result.undoId);
          await onApplied(result);
          onNotice(t("write.saved", { path: result.path }));
        } catch (error) {
          onNotice(`${t("error.prefix")}${error.message}`, true);
        } finally {
          setBusy(false);
        }
      };
      const undo = async () => {
        setBusy(true);
        try {
          await api.call("undoWrite", undoId);
          await onApplied(null);
          onNotice(t("write.undone"));
          onClose();
        } catch (error) {
          onNotice(`${t("error.prefix")}${error.message}`, true);
        } finally {
          setBusy(false);
        }
      };

      return h("div", { className: "vs-modal-back", onMouseDown: (event) => { if (event.target === event.currentTarget) onClose(); } },
        h("div", { className: "vs-modal" },
          h("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 } },
            h("div", null,
              h("h3", { className: "vs-modal-title" }, t("write.title")),
              h("p", { className: "vs-modal-sub" }, proposal ? t("write.preview") : `${form.operation === "create" ? t("write.create") : t("write.append")}`)),
            h("button", { type: "button", className: "vs-remove", onClick: onClose, "aria-label": "close" }, "×")),
          !proposal
            ? h("div", null,
              h("label", { className: "vs-field-label" }, t("write.path")),
              h("input", { className: "vs-input", style: { width: "100%", height: 32, margin: "4px 0 12px" }, value: form.targetPath, disabled: form.operation === "append", placeholder: "AI Inbox/…md", onChange: (event) => setForm({ ...form, targetPath: event.target.value }) }),
              h("label", { className: "vs-field-label" }, t("write.content")),
              h("textarea", { className: "vs-textarea", value: form.content, placeholder: "## Notes\n\n…", onChange: (event) => setForm({ ...form, content: event.target.value }) }),
              h("label", { className: "vs-field-label", style: { display: "block", marginTop: 12 } }, t("write.reason")),
              h("input", { className: "vs-input", style: { width: "100%", height: 32 }, value: form.reason, onChange: (event) => setForm({ ...form, reason: event.target.value }) }),
              h("div", { className: "vs-actions-right" },
                h(Button, { icon: "x", onClick: onClose }, t("action.cancel")),
                h(Button, { primary: true, icon: "spark", state: busy ? "loading" : "idle", disabled: busy || !form.content.trim(), onClick: propose }, t("action.apply"))))
            : h("div", null,
              h("div", { className: "vs-kicker" }, proposal.path),
              h("pre", { className: "vs-diff" }, proposal.diff.split("\n").map((line, index) => h("span", { key: index, style: line.startsWith("+") ? { color: "var(--vs-green)", display: "block" } : { display: "block" } }, line))),
              undoId
                ? h("div", { className: "vs-actions-right" },
                  h(Button, { icon: "check", onClick: onClose }, t("action.cancel")),
                  h(Button, { icon: "refresh", danger: true, onClick: undo, state: busy ? "loading" : "idle" }, t("write.undo")))
                : h("div", { className: "vs-actions-right" },
                  h(Button, { icon: "x", onClick: () => setProposal(null) }, t("action.cancel")),
                  h(Button, { primary: true, icon: "check", onClick: apply, state: busy ? "loading" : "idle" }, t("action.apply"))))));
    }

    function SettingsView({ t, api, settings, onSaved, onNotice }) {
      const [draft, setDraft] = useState(settings || {});
      const [busy, setBusy] = useState(false);
      const [status, setStatus] = useState(null);
      const [test, setTest] = useState("");
      const [saveState, setSaveState] = useState("idle");
      const [testState, setTestState] = useState("idle");
      const [reindexState, setReindexState] = useState("idle");

      useEffect(() => { if (!busy) setDraft(settings || {}); }, [settings, busy]);
      useEffect(() => {
        void api.call("indexStatus").then(setStatus).catch(() => {});
      }, []);

      const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
      const save = async () => {
        setBusy(true);
        setSaveState("loading");
        try {
          const saved = await api.call("updateSettings", draft);
          setDraft(saved);
          await onSaved(saved);
          onNotice(t("settings.saved"));
          setStatus(await api.call("indexStatus"));
          setSaveState("success");
          setTimeout(() => setSaveState("idle"), 1500);
        } catch (error) {
          setSaveState("idle");
          onNotice(`${t("error.prefix")}${error.message}`, true);
        } finally {
          setBusy(false);
        }
      };
      const testEmbedding = async () => {
        setBusy(true);
        setTest("");
        setTestState("loading");
        try {
          const result = await api.call("testEmbedding", draft);
          setTest(t("settings.testOk", { dims: result.dimensions }));
          if (result.dimensions) update("embeddingDimensions", result.dimensions);
          setTestState("success");
          setTimeout(() => setTestState("idle"), 1600);
        } catch (error) {
          setTestState("idle");
          setTest(t("settings.embeddingFailed", { error: error.message }));
        } finally {
          setBusy(false);
        }
      };
      const reindex = async () => {
        setBusy(true);
        setReindexState("loading");
        try {
          await api.call("reindex");
          onNotice(t("settings.reindexStarted"));
          setReindexState("success");
          setTimeout(() => setReindexState("idle"), 1600);
          setTimeout(async () => {
            try { setStatus(await api.call("indexStatus")); } catch {}
          }, 1200);
        } catch (error) {
          setReindexState("idle");
          onNotice(`${t("error.prefix")}${error.message}`, true);
        } finally {
          setBusy(false);
        }
      };

      return h("div", { className: "vs-settings-grid" },
        h("div", { className: "vs-card" },
          h("h3", { className: "vs-card-title", style: { marginBottom: 3 } }, t("settings.vault")),
          h("p", { className: "vs-card-sub" }, t("settings.vaultHint")),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.vaultPath")), h("div", { className: "vs-field-hint" }, "~/Vaults/second-brain")),
            h("input", { value: draft.vaultPath || "", onChange: (event) => update("vaultPath", event.target.value), placeholder: "~/Vaults/second-brain" })),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.indexMode")), h("div", { className: "vs-field-hint" }, t("settings.modeHint"))),
            h("select", { value: draft.indexMode || "keyword", onChange: (event) => update("indexMode", event.target.value) },
              h("option", { value: "hybrid" }, t("search.hybrid")),
              h("option", { value: "semantic" }, t("search.semantic")),
              h("option", { value: "keyword" }, t("search.keyword")))),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.watch")), h("div", { className: "vs-field-hint" }, t("settings.watchHint"))),
            h("button", { type: "button", className: "vs-switch", role: "switch", "aria-checked": String(Boolean(draft.watch)), onClick: () => update("watch", !draft.watch) })),
          h("h3", { className: "vs-card-title", style: { margin: "18px 0 3px" } }, t("settings.embedding")),
          h("p", { className: "vs-card-sub" }, t("settings.embeddingHint")),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.embeddingUrl"))),
            h("input", { value: draft.embeddingUrl || "", onChange: (event) => update("embeddingUrl", event.target.value), placeholder: "http://127.0.0.1:11434/api/embed" })),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.embeddingModel"))),
            h("input", { value: draft.embeddingModel || "", onChange: (event) => update("embeddingModel", event.target.value), placeholder: "bge-m3" })),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.embeddingKey")), h("div", { className: "vs-field-hint" }, t(draft.embeddingApiKeyConfigured ? "settings.embeddingKeySaved" : "settings.embeddingKeyEmpty"))),
            h("input", { type: "password", autoComplete: "new-password", value: draft.embeddingApiKey || "", onChange: (event) => update("embeddingApiKey", event.target.value), placeholder: draft.embeddingApiKeyConfigured ? "••••••••" : t("settings.optional") })),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.dimensions")), h("div", { className: "vs-field-hint" }, t("settings.dimensionsHint"))),
            h("input", { value: draft.embeddingDimensions || 1024, onChange: (event) => update("embeddingDimensions", Number(event.target.value) || 0) })),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("access.title")), h("div", { className: "vs-field-hint" }, t("access.settingHint"))),
            h("button", { type: "button", className: "vs-switch", role: "switch", "aria-checked": String(Boolean(draft.conversationEnabled)), onClick: () => update("conversationEnabled", !draft.conversationEnabled) })),
          h("div", { className: "vs-field" },
            h("div", { className: "vs-field-copy" }, h("div", { className: "vs-field-label" }, t("settings.autoWrite")), h("div", { className: "vs-field-hint" }, t("settings.autoWriteHint"))),
            h("button", { type: "button", className: "vs-switch", role: "switch", "aria-checked": String(Boolean(draft.autoApproveWrites)), onClick: () => update("autoApproveWrites", !draft.autoApproveWrites) })),
          h("div", { className: "vs-actions-right" },
            h(Button, { icon: "link", onClick: testEmbedding, state: testState, disabled: busy }, t("action.test")),
            h(Button, { primary: true, icon: "check", onClick: save, state: saveState, disabled: busy }, t("action.save"))),
          test ? h("div", { className: "vs-muted", style: { marginTop: 8 } }, test) : null,
          h("p", { className: "vs-muted", style: { marginTop: 12 } }, t("settings.privacy"))),
        h("div", { className: "vs-card" },
          h("h3", { className: "vs-card-title" }, t("index.title")),
          h("div", { className: "vs-health-list" },
            h("div", { className: "vs-health-row" }, h("span", null, t("index.building")), h("b", null, status?.building ? `${status.buildProgress}%` : t("index.idle"))),
            h("div", { className: "vs-health-row" }, h("span", null, t("index.embedding")), h("b", null, status?.embeddingReady ? t("index.ready") : `${status?.embeddingProgress ?? 0}%`)),
            h("div", { className: "vs-health-row" }, h("span", null, t("index.chunks")), h("b", null, formatNumber(status?.chunks ?? 0))),
            h("div", { className: "vs-health-row" }, h("span", null, t("index.vectors")), h("b", null, formatNumber(status?.vectors ?? 0)))),
          h("div", { className: "vs-progress" }, h("span", { style: { width: `${status?.building ? status.buildProgress : status?.embeddingProgress ?? 0}%` } })),
          h("div", { className: "vs-actions-right" }, h(Button, { icon: "refresh", onClick: reindex, state: reindexState, disabled: busy }, t("action.reindex"))),
          status?.embeddingError ? h("p", { className: "vs-muted", style: { color: "var(--dsw-alias-state-error-primary,#b23b3b)", marginTop: 8 } }, status.embeddingError) : null,
          status?.indexingError ? h("p", { className: "vs-muted", style: { color: "var(--dsw-alias-state-error-primary,#b23b3b)", marginTop: 8 } }, status.indexingError) : null,
          (status?.pending || status?.indexingError) ? h("div", { className: "vs-actions-right" }, h(Button, { icon: "refresh", onClick: reindex, disabled: busy }, t("action.retry"))) : null));
    }

    function VaultPage({ api, t: providedT }) {
      const t = makeT({ t: providedT });
      const [tab, setTab] = useState("dashboard");
      const [stats, setStats] = useState(null);
      const [settings, setSettings] = useState(null);
      const [notice, setNotice] = useState(null);
      const [error, setError] = useState("");
      const [loading, setLoading] = useState(true);
      const [requestedPath, setRequestedPath] = useState("");
      const [searchSeed, setSearchSeed] = useState("");
      const [indexStatus, setIndexStatus] = useState(null);
      const [refreshState, setRefreshState] = useState("idle");
      const [mountError, setMountError] = useState(api.mountError ?? "");
      useEffect(() => api.subscribeMountError?.(setMountError), [api]);
      const refreshSequence = useRef(0);
      const operationSequence = useRef(0);
      const [reindexState, setReindexState] = useState("idle");

      const notify = (message, isError = false) => setNotice({ message, error: isError, id: Date.now() });
      useEffect(() => {
        if (!notice) return;
        const id = setTimeout(() => setNotice(null), 4200);
        return () => clearTimeout(id);
      }, [notice]);

      const refresh = async () => {
        const sequence = ++refreshSequence.current;
        try {
          const [nextStats, nextSettings] = await Promise.all([
            api.call("stats"),
            api.call("getSettings")
          ]);
          if (sequence !== refreshSequence.current) return false;
          if (sequence > operationSequence.current) {
            setStats(nextStats);
            setSettings(nextSettings);
          }
          setError("");
          return true;
        } catch (caught) {
          if (sequence !== refreshSequence.current) return false;
          setError(caught instanceof Error ? caught.message : String(caught));
          return false;
        } finally {
          if (sequence === refreshSequence.current) setLoading(false);
        }
      };

      useEffect(() => { void refresh(); }, []);

      useEffect(() => {
        if (tab !== "dashboard" && tab !== "settings") return undefined;
        const id = setInterval(async () => {
          try {
            const status = await api.call("indexStatus");
            setIndexStatus(status);
            if (!status.building && !status.pending && !status.embeddingError && !status.indexingError) {
              if (status.embeddingReady) await refresh();
              clearInterval(id);
            }
          } catch (caught) {
            console.warn("[vault-studio] index status failed", caught);
          }
        }, 2200);
        return () => clearInterval(id);
      }, [tab, stats?.embedding?.enabled, stats?.embedding?.ready, stats?.embedding?.progress]);

      useEffect(() => {
        if (tab !== "dashboard") return;
        let alive = true;
        const id = setInterval(async () => {
          if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
          try {
            const usage = await api.call("usage");
            if (alive) setStats((current) => current ? { ...current, usage } : current);
          } catch {}
        }, 5000);
        return () => { alive = false; clearInterval(id); };
      }, [tab]);

      const refreshWithFeedback = async () => {
        setRefreshState("loading");
        const ok = await refresh();
        setRefreshState(ok ? "success" : "idle");
        if (ok) setTimeout(() => setRefreshState("idle"), 1500);
      };

      const reindex = async () => {
        setReindexState("loading");
        try {
          await api.call("reindex");
          notify(t("settings.reindexStarted"));
          setReindexState("success");
          setTimeout(() => setReindexState("idle"), 1600);
          setTimeout(() => void refresh(), 1200);
        } catch (caught) {
          setReindexState("idle");
          notify(`${t("error.prefix")}${caught.message}`, true);
        }
      };

      const openNote = (path) => {
        setRequestedPath(path);
        setTab("notes");
      };

      const openSearch = (query = "") => {
        setSearchSeed(query);
        setTab("search");
      };

      const openSearchTab = () => {
        setSearchSeed("");
        setTab("search");
      };

      const toggleConversation = async () => {
        const next = !settings?.conversationEnabled;
        const sequence = ++operationSequence.current;
        try {
          const saved = await api.call("updateSettings", { conversationEnabled: next });
          if (sequence === operationSequence.current) setSettings(saved);
          notify(next ? t("access.enabled") : t("access.disabled"));
        } catch (caught) {
          notify(`${t("error.prefix")}${caught.message}`, true);
        }
      };

      const quickUpdate = async (patch) => {
        const sequence = ++operationSequence.current;
        try {
          const saved = await api.call("updateSettings", patch);
          if (sequence === operationSequence.current) setSettings(saved);
          notify(t("settings.saved"));
          if (patch.indexMode || patch.watch) await refresh();
        } catch (caught) {
          notify(`${t("error.prefix")}${caught.message}`, true);
        }
      };

      const statusBadge = stats?.embedding?.enabled
        ? h("span", { className: `vs-badge ${stats.embedding.ready ? "ok" : "work"}` },
          h(Icon, { name: stats.embedding.ready ? "check" : "refresh", size: 10 }),
          (indexStatus?.embeddingReady ?? stats.embedding.ready)
            ? t("status.ready")
            : t("status.embedding", { progress: indexStatus?.embeddingProgress ?? stats.embedding.progress ?? 0 }))
        : h("span", { className: "vs-badge" }, t(`search.${stats?.indexMode || "keyword"}`));
      const actionButtons = h("div", { className: "vs-head-actions" },
        statusBadge,
        h(Button, { icon: "refresh", onClick: refreshWithFeedback, state: refreshState }, t("action.refresh")),
        h(Button, { icon: "refresh", onClick: reindex, state: reindexState }, t("action.reindex")));
      const compactHeader = tab === "dashboard" && Boolean(stats?.configured);
      const header = compactHeader
        ? h("div", { className: "vs-topline" },
          h("div", { className: "vs-topline-left" },
            h("span", { className: "vs-kicker" }, "OBSIDIAN VAULT STUDIO"),
            h("span", { className: "vs-topline-path" }, stats?.vaultPath || t("subtitle"))),
          actionButtons)
        : h("div", { className: "vs-header" },
          h("div", null,
            h("div", { className: "vs-kicker" }, t("header.kicker")),
            h("h1", { className: "vs-title" }, t("title")),
            h("p", { className: "vs-sub" }, stats?.vaultPath || t("subtitle"))),
          actionButtons);

      const tabs = h("div", { className: "vs-tabs", role: "tablist" },
        ["dashboard", "search", "notes", "settings"].map((id) =>
          h("button", { key: id, type: "button", className: `vs-tab${tab === id ? " active" : ""}`, onClick: () => { if (id === "search") openSearchTab(); else setTab(id); }, role: "tab", "aria-selected": tab === id },
            h(Icon, { name: id === "dashboard" ? "grid" : id === "search" ? "search" : id === "notes" ? "notes" : "settings", size: 12 }),
            t(`tab.${id}`))));

      let body;
      if (mountError) body = h("div", { className: "vs-empty" }, h(Icon, { name: "alert" }),
        h("div", null, mountError),
        h(Button, { icon: "refresh", onClick: () => { setMountError(""); void api.retryMount?.(); void refresh(); } }, t("action.retry")));
      else if (loading) body = h("div", { className: "vs-empty" }, h(Icon, { name: "refresh" }), t("loading"));
      else if (error) body = h("div", { className: "vs-empty" }, h(Icon, { name: "alert" }), h("div", null, error), h("div", { style: { marginTop: 10 } }, h(Button, { icon: "refresh", onClick: refresh }, t("action.refresh"))));
      else if (!stats?.configured && tab === "dashboard") body = h(SetupView, { t, settings, api, onDone: refresh, notify });
      else if (tab === "dashboard") body = h(Dashboard, { stats, t, onReindex: reindex, onOpenSearch: openSearch, onOpenSettings: () => setTab("settings"), onOpenNote: openNote, onOpenNotes: () => setTab("notes"), settings, onToggleConversation: toggleConversation, onQuickUpdate: quickUpdate });
      else if (tab === "search") body = h(SearchView, { t, api, onNotice: notify, onOpenNote: openNote, stats, initialQuery: searchSeed });
      else if (tab === "notes") body = h(NotesView, { t, api, onNotice: notify, requestedPath, onRefreshStats: refresh });
      else body = h(SettingsView, { t, api, settings, onSaved: refresh, onNotice: notify });

      return h("div", { className: "vs-root" }, h("style", null, CSS), header, tabs,

        indexStatus?.indexingError ? h("div", { className: "vs-empty" }, h("div", null, indexStatus.indexingError)) : null,
        body, h(Notice, { notice, onClose: () => setNotice(null) }));
    }

    const dictionaries = { en: DICT.en, zh: DICT.zh };

    function apply(ctx) {
      const readActiveLocale = () => {
        try {
          const snapshot = ctx.locale?.getSnapshot?.() ?? ctx.locale?.getLocale?.();
          if (snapshot?.active) activeLocale = String(snapshot.active);
        } catch {}
      };
      readActiveLocale();
      ctx.effect(() => {
        const unsubscribe = ctx.locale?.subscribe?.(readActiveLocale);
        return () => { if (typeof unsubscribe === "function") unsubscribe(); };
      }, "obsidian-vault-studio: active locale");

      let mounted;
      let disposed = false;
      let mounting = false;
      let mountingGeneration = 0;
      let remoteDisposer;
      let mountError = "";
      const mountErrorListeners = new Set();
      const notifyMountError = (error) => {
        mountError = error;
        for (const listener of mountErrorListeners) listener(error);
      };
      const api = {
        get mountError() { return mountError; },
        subscribeMountError(listener) { mountErrorListeners.add(listener); return () => mountErrorListeners.delete(listener); }
      };
      const mount = () => {
        if (disposed || mounting) return;
        mounting = true;
        const generation = ++mountingGeneration;
        // Wrap synchronous host failures as well as asynchronous rejection.
        mounted = Promise.resolve().then(() => ctx.remote.$mount(remoteContribution));
        mounted.then((dispose) => {
          if (generation !== mountingGeneration) {
            if (typeof dispose === "function") void dispose();
            return;
          }
          mounting = false;
          remoteDisposer = typeof dispose === "function" ? dispose : null;
          notifyMountError("");
        }).catch((error) => {
          if (disposed || generation !== mountingGeneration) return;
          mounting = false;
          notifyMountError(`Vault host registration failed: ${error instanceof Error ? error.message : String(error)}`);
          console.error("[vault-studio] remote registration failed", error);
        });
      };
      api.retryMount = () => {
        if (disposed || mounting) return;
        mountingGeneration += 1;
        mount();
      };
      mount();
      ctx.effect(() => {
        return () => {
          disposed = true;
          mountingGeneration += 1;
          mountErrorListeners.clear();
          void mounted.then(() => {
            if (typeof remoteDisposer === "function") remoteDisposer();
          }).catch(() => {});
        };
      }, "obsidian-vault-studio: remote contribution");
      ctx.effect(() => ctx.locale.register(NS, dictionaries), "obsidian-vault-studio: locale");

      async function call(method, ...args) {
        await mounted;
        // The namespace service is mounted after this Client plugin starts, so it
        // cannot be declared in `inject`. `ctx.get` is the non-injecting lookup
        // supported by Cordis; accessing it through ctx.remote would require the
        // dynamic service name at activation time and fail with "without inject".
        let namespace;
        if (typeof ctx.get === "function") {
          try { namespace = ctx.get(`remote.${NAMESPACE}`); } catch {}
        }
        if (!namespace) {
          try { namespace = ctx.remote[NAMESPACE]; } catch {}
        }
        if (!namespace || typeof namespace[method] !== "function") throw new Error("Vault host service is not available.");
        const result = await namespace[method](...args);
        if (result && typeof result.ok === "boolean") {
          if (!result.ok) throw new Error(result.error?.message || "Remote call failed.");
          return result.value;
        }
        return result;
      }

      // Keep the original live API object: it exposes the remote function and
      // the mountError accessor without copying or detaching either one.
      api.call = call;
      ctx.slots.inject("main", () => ctx.slots.register({
        name: "main",
        key: PANEL_ID,
        locale: NS,
        inject: () => ({ api })
      }, VaultPage));

      ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
        name: "sidebar.panellist",
        id: PANEL_ID,
        order: 24,
        locale: NS,
        label: () => (DICT[lang()] ?? DICT.en)["panel"]
      }, PanelIcon));
    }

    return { inject: ["slots", "remote", "locale"], apply };
  }
});
