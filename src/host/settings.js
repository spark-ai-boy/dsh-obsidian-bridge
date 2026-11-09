import { chmod, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join, resolve } from "node:path";

export const SETTINGS_VERSION = 2;

export const DEFAULT_SETTINGS = Object.freeze({
  version: SETTINGS_VERSION,
  vaultPath: "",
  dataDir: "",
  indexMode: "keyword",
  embeddingUrl: "http://127.0.0.1:11434/api/embed",
  embeddingModel: "bge-m3",
  embeddingDimensions: 1024,
  embeddingApiKey: "",
  embeddingConfigured: false,
  embeddingBatchSize: 24,
  embeddingTimeoutMs: 90_000,
  embeddingMaxRetries: 3,
  embeddingRetryDelayMs: 250,
  conversationEnabled: false,
  autoApproveWrites: false,
  watch: true,
  excludedFolders: ".obsidian,.trash,.git,node_modules",
  maxChunkChars: 2200,
  lastIndexedAt: ""
});

export function expandHome(value) {
  const text = String(value ?? "").trim();
  if (text === "~") return homedir();
  if (text.startsWith("~/")) return join(homedir(), text.slice(2));
  return text;
}

export function resolveDataDir(settings, configDataDir = "") {
  const configured = expandHome(settings.dataDir || configDataDir);
  if (configured) return isAbsolute(configured) ? configured : resolve(configured);
  return join(homedir(), ".dsh", "vault-studio");
}

function sanitizeSettings(value, defaults) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const result = {};
  const booleans = ["conversationEnabled", "autoApproveWrites", "watch"];
  const strings = ["vaultPath", "indexMode", "embeddingUrl", "embeddingModel", "embeddingApiKey", "excludedFolders", "lastIndexedAt"];
  for (const key of booleans) if (typeof input[key] === "boolean") result[key] = input[key];
  for (const key of strings) if (typeof input[key] === "string") result[key] = input[key].replace(/\0/g, "");
  if (result.indexMode && !["keyword", "semantic", "hybrid"].includes(result.indexMode)) result.indexMode = defaults.indexMode;
  for (const [key, minimum, maximum] of [
    ["embeddingDimensions", 1, 65_536], ["maxChunkChars", 400, 100_000],
    ["embeddingBatchSize", 1, 128], ["embeddingTimeoutMs", 1000, 600_000],
    ["embeddingMaxRetries", 0, 10], ["embeddingRetryDelayMs", 0, 60_000]
  ]) {
    if (Number.isFinite(input[key])) result[key] = Math.trunc(Math.max(minimum, Math.min(maximum, input[key])));
  }
  for (const key of Object.keys(defaults)) {
    if (["version", "dataDir", "embeddingConfigured"].includes(key)) continue;
    if (!(key in result)) result[key] = defaults[key];
  }
  result.version = SETTINGS_VERSION;
  result.embeddingConfigured = Boolean(input.embeddingConfigured) && typeof result.embeddingModel === "string" && typeof result.embeddingUrl === "string";
  return result;
}

export class SettingsStore {
  get publicSettings() {
    const { embeddingApiKey: _embeddingApiKey, ...settings } = this.settings;
    return { ...settings, embeddingApiKeyConfigured: Boolean(_embeddingApiKey) };
  }
  constructor({ dataDir, defaults = {} }) {
    this.dataDir = dataDir;
    this.defaults = { ...DEFAULT_SETTINGS, ...defaults };
    this.settings = { ...this.defaults };
    this.path = join(dataDir, "settings.json");
    this.writeChain = Promise.resolve();
    this.updateTail = Promise.resolve();
    this.ready = this.load();
  }

  async load() {
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    try {
      const raw = await readFile(this.path, "utf8");
      const parsed = JSON.parse(raw);
      const previous = parsed && typeof parsed === "object" ? parsed : {};
      const next = sanitizeSettings(previous, this.defaults);
      // The first release defaulted to hybrid even when no embedding service
      // existed. Migrate that untouched default to the local keyword index.
      if (Number(previous.version ?? 1) < 2 && next.indexMode === "hybrid" && previous.embeddingConfigured !== true) {
        next.indexMode = "keyword";
      }
      this.settings = next;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        // Corrupt settings should not stop the plugin from booting.
        this.settings = { ...this.defaults };
      }
    }
    this.settings.vaultPath = expandHome(this.settings.vaultPath);
    this.settings.dataDir = this.dataDir;
    return this.settings;
  }

  async update(patch) {
    const operation = this.updateTail.then(() => this.commit(patch));
    this.updateTail = operation.catch(() => {});
    return operation;
  }

  async commit(patch) {
    await this.ready;
    // UI settings contain a redacted API key, so an omitted or empty field
    // must retain the persisted secret rather than silently disabling access.
    const patchValue = patch && typeof patch === "object" ? { ...patch } : {};
    if ("embeddingApiKey" in patchValue && !patchValue.embeddingApiKey) delete patchValue.embeddingApiKey;
    const next = sanitizeSettings({ ...this.settings, ...patchValue }, this.defaults);
    if (next.indexMode !== "keyword" && !next.embeddingUrl?.trim()) {
      throw new Error("Semantic and hybrid search require an embedding service URL.");
    }
    next.embeddingUrl = next.embeddingUrl.trim();
    next.embeddingModel = next.embeddingModel.trim();
    if (next.indexMode !== "keyword") next.embeddingConfigured = true;
    if (next.vaultPath) next.vaultPath = expandHome(next.vaultPath);
    next.version = SETTINGS_VERSION;
    next.dataDir = this.dataDir;
    this.settings = next;
    await this.writeNext(next);
    return this.settings;
  }

  async save() {
    await this.writeNext(this.settings);
  }

  writeNext(value) {
    const snapshot = JSON.stringify(value, null, 2);
    const operation = this.writeChain.then(async () => {
      await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
      const temporary = `${this.path}.tmp-${randomUUID()}`;
      try {
        await writeFile(temporary, `${snapshot}\n`, { mode: 0o600 });
        await rename(temporary, this.path);
        await chmod(this.path, 0o600).catch(() => {});
      } catch (error) {
        await unlink(temporary).catch(() => {});
        throw error;
      }
    });
    // Preserve the failure for this caller, but let later saves recover after
    // the disk error is fixed; a rejected promise must not poison the queue.
    this.writeChain = operation.catch(() => {});
    return operation;
  }


  get() {
    return this.settings;
  }
}
