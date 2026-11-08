import { defineTool } from "@deepseek-ai/dsh-tools";

const searchResultSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", required: true },
    notePath: { type: "string", required: true },
    title: { type: "string", required: true },
    headingPath: { type: "array", required: true, items: { type: "string" } },
    snippet: { type: "string", required: true },
    score: { type: "number", required: true },
    matchedBy: { type: "array", required: true, items: { type: "string" } },
    line: { type: "number", required: true },
    tags: { type: "array", required: true, items: { type: "string" } },
    mtime: { type: "number", required: true }
  }
};

const proposalSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string", required: true },
    operation: { type: "string", required: true },
    path: { type: "string", required: true },
    diff: { type: "string", required: true },
    reason: { type: "string", required: true },
    citations: { type: "array", required: true, items: { type: "string" } },
    createdAt: { type: "string", required: true },
    status: { type: "string", required: true }
  }
};

function text(value) {
  return [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }];
}

function present(kind, title) {
  return { card: "generic", title, kind };
}

export function registerTools(ctx, service) {
  ctx.tools.register(defineTool({
    name: "obsidian_search",
    description: "Search the user's local Obsidian vault. Use this before answering questions about their notes. Returns matching note chunks with paths, headings, citations, keyword/vector provenance, and scores. Prefer hybrid mode unless the user asks for exact keyword matching.",
    parameters: {
      query: { type: "string", required: true, description: "Natural-language question or search query." },
      mode: { type: "string", description: "hybrid, semantic, or keyword. Defaults to the configured index mode." },
      limit: { type: "number", description: "Maximum number of chunks (1-50)." },
      folders: { type: "array", items: { type: "string" }, description: "Optional top-level folder filters." },
      tags: { type: "array", items: { type: "string" }, description: "Optional tag filters." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          query: { type: "string", required: true },
          mode: { type: "string", required: true },
          total: { type: "number", required: true },
          warning: { type: "string", required: true },
          results: { type: "array", required: true, items: searchResultSchema }
        }
      },
      render: (_args, value) => {
        if (!value.results.length) return text(value.warning || "No matching notes were found.");
        const lines = value.results.map((item, index) => {
          const heading = item.headingPath.length ? ` › ${item.headingPath.join(" › ")}` : "";
          return `[${index + 1}] ${item.title}${heading}\n${item.notePath} · lines ${item.line} · ${item.matchedBy.join("+")}\n${item.snippet}`;
        });
        return text(`${value.warning ? `${value.warning}\n\n` : ""}${lines.join("\n\n")}`);
      }
    },
    async execute(args, exec) {
      return service.search(args.query, {
        mode: args.mode,
        limit: args.limit,
        folders: args.folders,
        tags: args.tags
      }, exec.signal);
    },
    presentCall: (args) => present("read", `Search Obsidian: ${args.query}`)
  }));

  ctx.tools.register(defineTool({
    name: "obsidian_read_note",
    description: "Read one Markdown note from the configured Obsidian vault. Use after obsidian_search when the returned snippet is insufficient, or when the user names a note path.",
    parameters: {
      path: { type: "string", required: true, description: "Vault-relative path ending in .md." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          path: { type: "string", required: true },
          title: { type: "string", required: true },
          folder: { type: "string", required: true },
          tags: { type: "array", required: true, items: { type: "string" } },
          aliases: { type: "array", required: true, items: { type: "string" } },
          links: { type: "array", required: true, items: { type: "string" } },
          content: { type: "string", required: true },
          words: { type: "number", required: true },
          mtime: { type: "number", required: true },
          size: { type: "number", required: true },
          frontmatter: { type: "object", additionalProperties: true, required: true },
          headings: {
            type: "array",
            required: true,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                level: { type: "number", required: true },
                title: { type: "string", required: true },
                line: { type: "number", required: true }
              }
            }
          }
        }
      },
      render: (_args, value) => text(`# ${value.title}\n\nPath: ${value.path}\nTags: ${value.tags.join(", ") || "—"}\n\n${value.content}`)
    },
    async execute(args, exec) {
      return service.readNote(args.path, exec.signal);
    },
    presentCall: (args) => present("read", `Read ${args.path}`)
  }));

  ctx.tools.register(defineTool({
    name: "obsidian_stats",
    description: "Return a local dashboard of the Obsidian vault: note/word/tag/link/chunk counts, folders, tags, recent notes, 14-day activity, and knowledge health. Use for questions about the vault's state or coverage.",
    parameters: {},
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          configured: { type: "boolean", required: true },
          vaultPath: { type: "string", required: true },
          totalNotes: { type: "number", required: true },
          totalWords: { type: "number", required: true },
          totalTags: { type: "number", required: true },
          totalLinks: { type: "number", required: true },
          totalChunks: { type: "number", required: true },
          lastIndexedAt: { type: "string", required: true },
          indexMode: { type: "string", required: true },
          error: { type: "string", required: true },
          folders: { type: "array", required: true, items: { type: "object", additionalProperties: true } },
          tags: { type: "array", required: true, items: { type: "object", additionalProperties: true } },
          recent: { type: "array", required: true, items: { type: "object", additionalProperties: true } },
          activity: { type: "array", required: true, items: { type: "object", additionalProperties: true } },
          heatmap: { type: "array", required: true, items: { type: "object", additionalProperties: true } },
          composition: { type: "object", required: true, additionalProperties: true },
          usage: { type: "object", required: true, additionalProperties: true },
          health: { type: "object", additionalProperties: true, required: true },
          embedding: { type: "object", additionalProperties: true, required: true }
        }
      },
      render: (_args, value) => text(JSON.stringify(value, null, 2))
    },
    async execute() {
      return service.stats();
    },
    presentCall: () => present("read", "Obsidian vault statistics")
  }));

  ctx.tools.register(defineTool({
    name: "obsidian_list_notes",
    description: "List or filter notes in the Obsidian vault by title/path/tag text and an optional top-level folder. Use to discover note paths before reading or proposing a write.",
    parameters: {
      query: { type: "string", description: "Text to match against title, path, and tags." },
      folder: { type: "string", description: "Exact top-level folder name." },
      limit: { type: "number", description: "Maximum notes (1-200)." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          notes: { type: "array", required: true, items: { type: "object", additionalProperties: true } },
          total: { type: "number", required: true }
        }
      },
      render: (_args, value) => text(value.notes.map((note) => `${note.path} · ${note.title} · ${note.words} words`).join("\n") || "No notes found.")
    },
    async execute(args) {
      const notes = await service.listNotes(args);
      return { notes, total: notes.length };
    },
    presentCall: () => present("read", "List Obsidian notes")
  }));

  ctx.tools.register(defineTool({
    name: "obsidian_propose_write",
    description: "Propose creating a new Markdown note or appending a block to an existing note. This does NOT write to disk. Show the returned diff to the user and call obsidian_apply_write only after they confirm. Never use this to overwrite or delete a note.",
    parameters: {
      operation: { type: "string", required: true, description: "create or append." },
      targetPath: { type: "string", description: "Vault-relative .md path. Omit for an AI Inbox path." },
      content: { type: "string", required: true, description: "Markdown content to add." },
      reason: { type: "string", description: "Why this note or append is useful." },
      citations: { type: "array", items: { type: "string" }, description: "Source note paths used for this content." }
    },
    output: {
      schema: proposalSchema,
      render: (_args, value) => text(`Proposed ${value.operation}: ${value.path}\n\nProposal id: ${value.id}\n\n${value.diff}`)
    },
    async execute(args) {
      return service.proposeWrite(args);
    },
    presentCall: (args) => present("write", `Propose ${args.operation}: ${args.targetPath || "new note"}`)
  }));

  ctx.tools.register(defineTool({
    name: "obsidian_apply_write",
    description: "Apply a previously proposed Obsidian write. This is a side-effecting operation and requires user approval. Call only after the user has seen and confirmed the proposal diff. Returns an undo id when successful.",
    parameters: {
      proposalId: { type: "string", required: true, description: "Proposal id returned by obsidian_propose_write." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          undoId: { type: "string", required: true },
          path: { type: "string", required: true },
          operation: { type: "string", required: true },
          bytesAdded: { type: "number", required: true }
        }
      },
      render: (_args, value) => text(`Saved to ${value.path}. Undo id: ${value.undoId}`)
    },
    async execute(args) {
      return service.applyWrite(args.proposalId);
    },
    presentCall: () => present("write", "Apply Obsidian write")
  }));

  ctx.tools.register(defineTool({
    name: "obsidian_undo_write",
    description: "Undo a write applied in this session. This is destructive and requires user approval. Use only when the user explicitly asks to undo a specific write.",
    parameters: {
      undoId: { type: "string", required: true, description: "Undo id returned by obsidian_apply_write." }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          path: { type: "string", required: true },
          undone: { type: "boolean", required: true }
        }
      },
      render: (_args, value) => text(value.undone ? `Undid write to ${value.path}.` : `Nothing was undone for ${value.path}.`)
    },
    async execute(args) {
      return service.undoWrite(args.undoId);
    },
    presentCall: () => present("write", "Undo Obsidian write")
  }));

  ctx.tools.register(defineTool({
    name: "obsidian_index_status",
    description: "Return local Obsidian index status, including build progress, embedding progress, chunk count, and any indexing error. Use when search results look stale or the user asks about indexing.",
    parameters: {},
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          building: { type: "boolean", required: true },
          buildProgress: { type: "number", required: true },
          embeddingReady: { type: "boolean", required: true },
          embeddingProgress: { type: "number", required: true },
          embeddingError: { type: "string", required: true },
          chunks: { type: "number", required: true },
          vectors: { type: "number", required: true }
        }
      },
      render: (_args, value) => text(JSON.stringify(value, null, 2))
    },
    async execute() {
      return service.indexStatus();
    },
    presentCall: () => present("read", "Obsidian index status")
  }));
}
