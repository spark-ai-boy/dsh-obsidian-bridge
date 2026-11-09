import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { mkdtemp, readFile, realpath, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { UsageStore } from "../src/host/usage.js";
import { SettingsStore } from "../src/host/settings.js";
import { WriteManager } from "../src/host/writes.js";
import { parseNote, parseFrontmatter } from "../src/host/markdown.js";
import { VaultIndex } from "../src/host/vault.js";
import { embedTexts } from "../src/host/embeddings.js";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "obsidian-regression-"));
  const vault = join(root, "vault");
  await mkdir(vault, { recursive: true });
  return { root, vault: await realpath(vault), data: join(root, "data") };
}

async function applied(manager, path = "test.md", content = "# Test\nfirst") {
  const proposal = await manager.propose({ targetPath: path, content, operation: "create" });
  return { proposal, result: await manager.apply(proposal.id) };
}

async function embeddingServer(handler) {
  const server = createServer((request, response) => response.end(JSON.stringify({
    data: [{ embedding: [1, 0], index: 0 }]
  })));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  // Replace the successive callback, retaining the listening server fixture.
  server.removeAllListeners("request");
  server.on("request", handler);
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}/v1/embeddings`,
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

test("apply is idempotent and two committed appends retain both blocks", async () => {
  const { root, vault, data } = await fixture();
  try {
    await writeFile(join(vault, "note.md"), "# Original\n");
    const manager = new WriteManager({ vaultPath: vault, dataDir: data });
    await manager.ready;
    const proposal = await manager.propose({ targetPath: "note.md", content: "\nfirst", operation: "append" });
    await Promise.all([manager.apply(proposal.id), manager.apply(proposal.id).catch((error) => error)]);
    const second = await manager.propose({ targetPath: "note.md", content: "\nsecond", operation: "append" });
    await Promise.all([manager.apply(second.id), manager.apply(second.id).catch((error) => error)]);
    assert.equal(await readFile(join(vault, "note.md"), "utf8"), "# Original\n\nfirst\n\nsecond\n");
    await manager.flush();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("exclusive create and append keep concurrent editor contents", async () => {
  const { root, vault, data } = await fixture();
  try {
    const manager = new WriteManager({ vaultPath: vault, dataDir: data });
    const created = await manager.propose({ targetPath: "race.md", content: "agent content", operation: "create" });
    const backup = manager.writeBackup.bind(manager);
    let raceCreate;
    manager.writeBackup = async (...args) => {
      if (!raceCreate) {
        raceCreate = writeFile(join(vault, "race.md"), "editor wins\n");
        await raceCreate;
      }
      return backup(...args);
    };
    await assert.rejects(() => manager.apply(created.id), /EEXIST|created after/);
    assert.equal(await readFile(join(vault, "race.md"), "utf8"), "editor wins\n");

    await writeFile(join(vault, "append-race.md"), "base\n");
    const appended = await manager.propose({ targetPath: "append-race.md", content: "agent tail\nMARKER", operation: "append" });
    manager.writeBackup = async (...args) => {
      await writeFile(join(vault, "append-race.md"), "editor update\n");
      return backup(...args);
    };
    await assert.rejects(() => manager.apply(appended.id), /changed after/);
    assert.equal(await readFile(join(vault, "append-race.md"), "utf8"), "editor update\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("undo survives restart, cannot affect another vault, and never revives landed undo", async () => {
  const { root, vault, data } = await fixture();
  await mkdir(join(root, "other-vault"), { recursive: true });
  const other = await realpath(join(root, "other-vault"));
  try {
    const manager = new WriteManager({ vaultPath: vault, dataDir: data });
    await manager.ready;
    const { result } = await applied(manager, "persist.md", "original");
    const recovered = new WriteManager({ vaultPath: vault, dataDir: data });
    await recovered.ready;
    assert.equal((await recovered.undoFor(result.undoId)).path, "persist.md");
    const switched = new WriteManager({ vaultPath: other, dataDir: data });
    await switched.ready;
    switched.setVaultPath(other, other);
    await assert.rejects(() => switched.undo(result.undoId), /different vault/);
    assert.equal(await readFile(join(vault, "persist.md"), "utf8"), "original\n");
    assert.deepEqual(await recovered.undo(result.undoId), { path: "persist.md", undone: true });
    await recovered.flush();
    const afterUndo = new WriteManager({ vaultPath: vault, dataDir: data });
    await afterUndo.ready;
    await assert.rejects(() => afterUndo.undo(result.undoId), /not found|not available/);
    await applied(afterUndo, "ok.md");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a crash backup of an unmaterialized create never deletes existing content", async () => {
  const { root, vault, data } = await fixture();
  try {
    await mkdir(join(data, "backups"), { recursive: true });
    const record = {
      undoId: "00000000-0000-4000-8000-000000000001", proposalId: "proposal",
      operation: "create", path: "important.md", beforeContent: "", afterContent: "not yet written",
      createdAt: new Date().toISOString(), vaultPath: vault, realVaultPath: vault, afterHash: "a".repeat(40), beforeHash: "", status: "pending"
    };
    await writeFile(join(data, "backups", `${record.undoId}.json`), JSON.stringify({ version: 2, ...record }));
    await writeFile(join(vault, "important.md"), "unrelated user text");
    const manager = new WriteManager({ vaultPath: vault, dataDir: data });
    await manager.ready;
    await assert.rejects(() => manager.undo(record.undoId), /interrupted|left untouched/);
    assert.equal(await readFile(join(vault, "important.md"), "utf8"), "unrelated user text");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("embeddings without a caller signal respect HTTP errors and returned indices", async (t) => {
  const fixtureApi = await embeddingServer(async (request, response) => {
    if (request.headers["x-test-failure"]) response.statusCode = 429;
    response.end(JSON.stringify({ data: [
      { embedding: [0, 2], index: 1 }, { embedding: [3, 0], index: 0 }
    ] }));
  });
  t.after(fixtureApi.close);
  const [a, b] = await embedTexts({ embeddingUrl: fixtureApi.url, embeddingModel: "fixture", embeddingDimensions: 2 }, ["a", "b"]);
  assert.deepEqual(a, [1, 0]);
  assert.deepEqual(b, [0, 1]);
});

test("stale remote mount failures cannot overwrite a successful retry", async () => {
  const mounts = [];
  let injectedApi;
  const ctx = {
    remote: { $mount: () => new Promise((resolve, reject) => mounts.push({ resolve, reject })) },
    slots: { inject(slot, callback) { return callback(ctx.slots); }, register(options) { if (options.name === "main") sandbox.__panelApi = options.inject().api; return options; } },
    get(name) { return name === "remote.obsidianVault" ? { stats: () => ({ configured: true }) } : undefined; },
    locale: { lang: () => "en", onChange() {}, register() {} },
    effect() {}
  };
  const sandbox = {
    window: { __ModuleLoader__: {} },
    console: { ...console, warn() {}, error() {} }
  };
  sandbox.window.__ModuleLoader__.load = (module) => { sandbox.__clientPlugin = module.factory(() => ({ createElement() {}, useEffect() {}, useMemo() {}, useRef() {}, useState() {} })); };
  const source = readFileSync(new URL("../client.js", import.meta.url), "utf8")
    .replace("const api = {", "const api = globalThis.__testApi = {");
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox);
  sandbox.__clientPlugin.apply(ctx);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(mounts.length, 1);
  injectedApi = sandbox.__panelApi;
  assert.equal(typeof injectedApi.call, "function", "the panel receives the remote call implementation");
  const pendingCall = assert.rejects(
    Promise.resolve().then(() => injectedApi.call("stats")),
    /expected host mount failure/
  );
  mounts[0].reject(new Error("expected host mount failure"));
  await pendingCall;
  await new Promise((resolve) => setImmediate(resolve));
  injectedApi.retryMount();
  injectedApi.retryMount(); // An in-flight retry must not overwrite the pending call.
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(mounts.length, 2);
  mounts[1].resolve(() => {});
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(await injectedApi.call("stats"), { configured: true });
  mounts[0].reject(new Error("obsolete failure"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(injectedApi.mountError, "");
  mounts[0].reject(new Error("obsolete failure"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(injectedApi.mountError, "");
});

test("semantic no-result preserves the requested mode and scans are serial", async (t) => {
  const { root, vault, data } = await fixture();
  await writeFile(join(vault, "only.md"), "# Only\nwords");
  const api = await embeddingServer((_request, response) => response.end(JSON.stringify({
    data: [{ index: 0, embedding: [1, 0] }]
  })));
  t.after(api.close);
  const service = new VaultIndex({ config: {
    vaultPath: vault, dataDir: data, indexMode: "semantic", watch: false,
    embeddingUrl: api.url, embeddingModel: "fixture", embeddingDimensions: 2,
    embeddingTimeoutMs: 5000, embeddingBatchSize: 24
  } });
  t.after(() => service.dispose());
  await service.initialize();
  service.settings = await service.settingsStore.update({ maxChunkChars: 2000 });
  const original = service.rebuild.bind(service);
  let active = 0;
  let maxActive = 0;
  service.rebuild = async (options) => { active++; maxActive = Math.max(maxActive, active); try { await new Promise((resolve) => setTimeout(resolve, 10)); return await original(options); } finally { active--; } };
  await Promise.all([
    service.updateSettings({ maxChunkChars: 2200 }),
    service.updateSettings({ maxChunkChars: 2300 }),
    service.updateSettings({ maxChunkChars: 2400 })
  ]);
  assert.equal(maxActive, 1, JSON.stringify({ maxActive, ...service.status() }));
  const result = await service.search({ query: "unmatched", mode: "semantic" });
  t.after(async () => {
    await service.dispose();
    await rm(root, { recursive: true, force: true });
  });
  assert.equal(result.mode, "semantic");
  assert.equal(result.total, 0);
});

test("semantic transport errors are reported by the direct query path", async () => {
  const service = new VaultIndex({ config: { embeddingUrl: "http://127.0.0.1:1/v1/embeddings", embeddingTimeoutMs: 1000 } });
  service.settings = { ...service.config, indexMode: "semantic" };
  const previousErrors = [];
  const result = await service.queryVector("query");
  assert.equal(result, null);
  assert.equal(service.queryCache.size, 0);
  assert.match(service.embeddingError, /Embedding request failed/);
  await service.dispose();
});

test("settings validate persisted values and never expose secrets", async () => {
  const root = await mkdtemp(join(tmpdir(), "vault-studio-settings-validation-"));
  try {
    const store = new SettingsStore({ dataDir: root });
    await store.update({ embeddingApiKey: "secret", embeddingBatchSize: 512, watch: "false", indexMode: "garbage", newUnknown: "x" });
    const settings = store.publicSettings;
    assert.equal("embeddingApiKey" in settings, false);
    assert.equal(settings.embeddingApiKeyConfigured, true);
    assert.equal(store.settings.embeddingApiKey, "secret");
    assert.equal(store.settings.embeddingBatchSize, 128);
    assert.equal(store.settings.watch, true);
    assert.equal(store.settings.indexMode, "keyword");
    assert.equal("newUnknown" in store.settings, false);
    assert.equal(JSON.stringify(settings).includes("secret"), false);
    await store.update({ embeddingApiKey: "" });
    assert.equal(store.settings.embeddingApiKey, "secret");
    const raw = JSON.parse(await readFile(join(root, "settings.json"), "utf8"));
    assert.equal("embeddingApiKey" in raw, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("settings writes recover after a transient destination failure", async () => {
  const root = await mkdtemp(join(tmpdir(), "vault-studio-write-recovery-"));
  try {
    const store = new SettingsStore({ dataDir: root });
    await store.ready;
    await writeFile(store.path, "{}\n");
    await rm(store.path);
    await mkdir(store.path, { recursive: true }); // Renaming a file over a directory fails reliably.
    await assert.rejects(() => store.update({ maxChunkChars: 2300 }), /EISDIR|EPERM/);
    await rm(store.path, { recursive: true });
    await store.update({ maxChunkChars: 2400 });
    const persisted = JSON.parse(await readFile(store.path, "utf8"));
    assert.equal(persisted.maxChunkChars, 2400);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("malformed persisted usage numbers and keys cannot become counters", async () => {
  const root = await mkdtemp(join(tmpdir(), "vault-studio-usage-malformed-"));
  try {
    await writeFile(join(root, "usage.json"), JSON.stringify({
      total: "bad", byTool: { obsidian_search: 7, __proto__: 1000, nasty: NaN },
      daily: { "2026-11-08": 2, "__proto__": 200 }, monthly: {}
    }));
    const store = new UsageStore({ dataDir: root });
    await store.ready;
    assert.equal(store.summary(new Date("2026-11-08T04:00:00Z")).total, 7);
    assert.equal(Object.hasOwn(store.data.daily, "__proto__"), false);
    await store.record("obsidian_search", new Date("2026-11-08T04:00:00Z"));
    assert.equal(store.data.total, 8);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("approval diff includes every added line and exactly the text to be written", async () => {
  const { root, vault, data } = await fixture();
  try {
    const manager = new WriteManager({ vaultPath: vault, dataDir: data });
    const content = Array.from({ length: 150 }, (_, i) => `line-${i}`).join("\n");
    const proposal = await manager.propose({ operation: "create", targetPath: "long.md", content });
    for (let i = 0; i < 150; i++) assert.match(proposal.diff, new RegExp(`^\\+ line-${i}$`, "m"));
    assert.equal(proposal.diff.startsWith(`--- /dev/null\n+++ new note\n@@\n+ ${content.split("\n").join("\n+ ")}`), true);
    assert.doesNotMatch(proposal.diff, /omitted|truncated/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("quote-aware YAML and chunk boundaries preserve real frontmatter and line ranges", () => {
  const parsed = parseFrontmatter("---\r\n一级分类: 个人\r\ntags: [\"RAG,hybrid\", 'local', other] # comment\r\naliases: \"[[Name]]\"\r\n---\r\n# title\r\nBody");
  assert.equal(parsed.bodyLineOffset, 5);
  assert.equal(parsed.frontmatter["一级分类"], "个人");
  assert.deepEqual(parsed.frontmatter.tags, ["RAG,hybrid", "local", "other"]);
  const aliasedNote = parseNote({ path: "note.md", raw: "---\naliases: \"[[Name]]\"\n---\n# title\nBody", mtime: 0, size: 0 });
  assert.deepEqual(aliasedNote.aliases, ["Name"]);
  assert.deepEqual(parsed.frontmatter.aliases, [["Name"]]); // YAML's valid nested flow sequence.
  const raw = "# Title\n\nThis is a verifiable, quite long paragraph with underscores: file_name, `under_score` and *emphasis*.\n\nNext.\n";
  const note = parseNote({ path: "note.md", raw, mtime: 0, size: raw.length, maxChunkChars: 400 });
  for (const chunk of note.chunks) {
    const lines = raw.split("\n");
    const actual = lines.slice(chunk.startLine - 1, chunk.endLine).join("\n").trim();
    assert.equal(actual, chunk.text.trim());
  }
  assert.ok(note.title.includes("file_name") || note.chunks.some((chunk) => chunk.searchText.includes("file_name")));
});
