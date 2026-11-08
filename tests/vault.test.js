import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VaultIndex } from "../src/host/vault.js";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "vault-studio-test-"));
  await mkdir(join(root, "技术"), { recursive: true });
  await mkdir(join(root, "读书"), { recursive: true });
  await writeFile(join(root, "技术", "RAG.md"), "---\ntags: [RAG, LLM]\n---\n# RAG 检索策略\n\n混合检索结合 BM25 和向量。\n\n## 实验\n\n做一个基线。\n");
  await writeFile(join(root, "读书", "笔记.md"), "# 卡片笔记\n\n用自己的话重写，并建立 [[RAG]] 链接。\n");
  return root;
}

test("indexes, searches, and reports stats", async () => {
  const root = await fixture();
  const index = new VaultIndex({
    config: { vaultPath: root, dataDir: join(root, ".data"), indexMode: "keyword", watch: false }
  });
  try {
    await index.initialize();
    const stats = index.stats();
    assert.equal(stats.totalNotes, 2);
    assert.equal(stats.totalChunks, 3);
    assert.equal(stats.tags[0].name, "RAG");
    assert.equal(stats.health.brokenLinks, 0);
    assert.equal(stats.heatmap.length, 365);
    assert.ok(stats.heatmap.every((day) => day.level >= 0 && day.level <= 4));
    assert.equal(typeof stats.composition.taggedNotes, "number");
    assert.equal(stats.composition.taggedNotes + stats.composition.untaggedNotes, stats.totalNotes);
    assert.ok(stats.composition.tagCoverage >= 0 && stats.composition.tagCoverage <= 100);
    assert.ok(stats.composition.updatedLast7 >= 0 && stats.composition.updatedLast7 <= stats.totalNotes);
    assert.equal(stats.usage.total, 0);
    await index.recordUsage("obsidian_search");
    assert.equal(index.stats().usage.total, 1);
    assert.equal(index.stats().usage.byTool[0].name, "obsidian_search");
    const result = await index.search({ query: "RAG", mode: "keyword" });
    assert.ok(result.results.length >= 1);
    assert.equal(result.results[0].title, "RAG 检索策略");
    assert.ok(result.results[0].matchedBy.includes("keyword"));
    const note = await index.readNote("技术/RAG.md");
    assert.ok(note.content.includes("混合检索"));
  } finally {
    index.dispose();
    await rm(root, { recursive: true, force: true });
  }
});

test("settings save returns before background embedding finishes", async () => {
  const root = await fixture();
  const index = new VaultIndex({
    config: { vaultPath: root, dataDir: join(root, ".data"), indexMode: "keyword", watch: false }
  });
  try {
    await index.initialize();
    const started = Date.now();
    const saved = await index.updateSettings({ indexMode: "hybrid" });
    assert.equal(saved.indexMode, "hybrid");
    assert.ok(Date.now() - started < 1000, "save should not wait for embedding");
    if (index.rebuildTask) await index.rebuildTask;
  } finally {
    index.dispose();
    await rm(root, { recursive: true, force: true });
  }
});

test("keyword search supports Latin prefixes for type-ahead", async () => {
  const root = await fixture();
  await writeFile(join(root, "技术", "Search.md"), "# Retrieval\n\nA retrieval pipeline with reranking.\n");
  const index = new VaultIndex({
    config: { vaultPath: root, dataDir: join(root, ".data"), indexMode: "keyword", watch: false }
  });
  try {
    await index.initialize();
    const result = await index.search({ query: "retr", mode: "keyword" });
    assert.ok(result.results.some((item) => item.title === "Retrieval"));
    const oneChar = await index.search({ query: "r", mode: "keyword" });
    assert.ok(oneChar.results.some((item) => item.notePath === "技术/Search.md"));
  } finally {
    index.dispose();
    await rm(root, { recursive: true, force: true });
  }
});

test("persists and reloads the keyword index", async () => {
  const root = await fixture();
  const config = { vaultPath: root, dataDir: join(root, ".data"), indexMode: "keyword", watch: false };
  const first = new VaultIndex({ config });
  await first.initialize();
  first.dispose();
  const second = new VaultIndex({ config });
  try {
    await second.initialize();
    assert.equal(second.stats().totalNotes, 2);
    const result = await second.search({ query: "卡片", mode: "keyword" });
    assert.ok(result.results.some((item) => item.title === "卡片笔记"));
  } finally {
    second.dispose();
    await rm(root, { recursive: true, force: true });
  }
});

test("supports safe create, append, and undo", async () => {
  const root = await fixture();
  const index = new VaultIndex({
    config: { vaultPath: root, dataDir: join(root, ".data"), indexMode: "keyword", watch: false }
  });
  try {
    await index.initialize();
    const create = await index.proposeWrite({
      operation: "create",
      targetPath: "AI Inbox/新笔记.md",
      content: "## 结论\n\n这是生成内容。",
      reason: "test"
    });
    assert.equal(create.operation, "create");
    assert.ok(create.diff.includes("+ ## 结论"));
    const applied = await index.applyWrite(create.id);
    assert.ok(applied.undoId);
    assert.ok((await readFile(join(root, "AI Inbox", "新笔记.md"), "utf8")).includes("生成内容"));

    const append = await index.proposeWrite({
      operation: "append",
      targetPath: "技术/RAG.md",
      content: "## 追加\n\n新实验。",
      reason: "test"
    });
    const appended = await index.applyWrite(append.id);
    assert.ok((await readFile(join(root, "技术", "RAG.md"), "utf8")).includes("新实验"));
    await index.undoWrite(appended.undoId);
    assert.ok(!(await readFile(join(root, "技术", "RAG.md"), "utf8")).includes("新实验"));
    await index.undoWrite(applied.undoId);
    await assert.rejects(readFile(join(root, "AI Inbox", "新笔记.md"), "utf8"));
  } finally {
    index.dispose();
    await rm(root, { recursive: true, force: true });
  }
});

test("semantic mode embeds chunks and ranks by vector", async () => {
  const root = await fixture();
  const server = http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    const texts = Array.isArray(payload.input) ? payload.input : [payload.prompt];
    const data = texts.map((text) => ({
      embedding: [
        text.includes("RAG") ? 1 : 0.1,
        text.includes("卡片") ? 1 : 0.1,
        0.2,
        0.3,
        0.4
      ]
    }));
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ data }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const index = new VaultIndex({
    config: {
      vaultPath: root,
      dataDir: join(root, ".data"),
      indexMode: "hybrid",
      watch: false,
      embeddingUrl: `http://127.0.0.1:${port}/v1/embeddings`,
      embeddingModel: "mock-embedding",
      embeddingDimensions: 5
    }
  });
  try {
    await index.initialize();
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if (index.status().embeddingReady) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.equal(index.status().embeddingReady, true);
    assert.equal(index.status().vectors, index.status().chunks);
    const result = await index.search({ query: "卡片笔记", mode: "semantic" });
    assert.ok(result.results.length > 0);
    assert.ok(result.results[0].matchedBy.includes("vector"));
  } finally {
    index.dispose();
    server.close();
    await rm(root, { recursive: true, force: true });
  }
});

test("one poisoned text no longer aborts the embedding run", async () => {
  const root = await fixture();
  let requests = 0;
  const server = http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    const texts = Array.isArray(payload.input) ? payload.input : [payload.prompt];
    requests += 1;
    // Reject any batch that still contains the poisoned text, the way a
    // gateway-side content filter drops the connection without a response.
    if (texts.some((text) => text.includes("$ curl"))) {
      req.socket.destroy();
      return;
    }
    const data = texts.map((text) => ({ embedding: [0.5, 0.5, 0.2, 0.3, 0.4] }));
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ data }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await writeFile(
    join(root, "技术", "Shell示例.md"),
    "# Shell 示例\n\n下面这个命令会被网关拦截。\n\n```bash\n$ curl http://prometheus:9090/api/v1/query\n```\n\n结尾还有正常内容。\n"
  );
  const index = new VaultIndex({
    config: {
      vaultPath: root,
      dataDir: join(root, ".data"),
      indexMode: "hybrid",
      watch: false,
      embeddingUrl: `http://127.0.0.1:${port}/v1/embeddings`,
      embeddingModel: "mock-embedding",
      embeddingDimensions: 5
    }
  });
  try {
    await index.initialize();
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (index.status().embeddingReady) break;
      if (index.status().embeddingError) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const status = index.status();
    assert.equal(status.embeddingReady, true, "embedding run must complete despite the poisoned chunk");
    assert.equal(status.embeddingError, "");
    assert.ok(status.vectors >= status.chunks - 1, "all clean chunks must be embedded");
    assert.ok(requests > 4, "bisection must have isolated the poisoned chunk");
  } finally {
    index.dispose();
    server.close();
    await rm(root, { recursive: true, force: true });
  }
});
