import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
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

export class SettingsStore {
  constructor({ dataDir, defaults = {} }) {
    this.dataDir = dataDir;
    this.defaults = { ...DEFAULT_SETTINGS, ...defaults };
    this.settings = { ...this.defaults };
    this.path = join(dataDir, "settings.json");
    this.ready = this.load();
  }

  async load() {
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    try {
      const raw = await readFile(this.path, "utf8");
      const parsed = JSON.parse(raw);
      const previous = parsed && typeof parsed === "object" ? parsed : {};
      const next = {
        ...this.defaults,
        ...previous,
        version: SETTINGS_VERSION
      };
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
    await this.ready;
    const next = { ...this.settings, ...(patch ?? {}) };
    if (next.indexMode && next.indexMode !== "keyword") next.embeddingConfigured = true;
    if (next.vaultPath) next.vaultPath = expandHome(next.vaultPath);
    next.version = SETTINGS_VERSION;
    next.dataDir = this.dataDir;
    this.settings = next;
    await this.save();
    return this.settings;
  }

  async save() {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    await writeFile(this.path, `${JSON.stringify(this.settings, null, 2)}\n`, {
      mode: 0o600
    });
    await chmod(this.path, 0o600).catch(() => {});
  }

  get() {
    return this.settings;
  }
}
