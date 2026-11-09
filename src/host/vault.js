import { randomUUID } from "node:crypto";
import { watch } from "node:fs";
import { mkdir, readFile, readdir, realpath, rename, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { embedTexts, testEmbedding } from "./embeddings.js";
import {
  parseNote,
  sha1,
  snippetAround,
  tokenize
} from "./markdown.js";
import { expandHome, resolveDataDir, SettingsStore } from "./settings.js";
import { UsageStore } from "./usage.js";
import { WriteManager } from "./writes.js";

const INDEX_VERSION = 2;
const DEFAULT_LIMIT = 12;

function isInside(root, candidate) {
  const relation = relative(root, candidate);
  return relation === "" || (!relation.startsWith("..") && !isAbsolute(relation));
}

function toPosix(value) {
  return value.split("\\").join("/");
}

function noteKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\.md$/i, "")
    .trim();
}

function folderOf(path) {
  return path.includes("/") ? path.split("/")[0] : "(root)";
}

function dateKey(timestamp) {
  const date = new Date(timestamp);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function emptyUsage() {
  return { total: 0, byTool: [], today: 0, month: 0, last7: 0, last30: 0, daily: [], monthly: [], lastUsedAt: "" };
}

function emptyStats(settings, extras = {}) {
  return {
    configured: Boolean(settings.vaultPath),
    vaultPath: settings.vaultPath || "",
    totalNotes: 0,
    totalWords: 0,
    totalTags: 0,
    totalLinks: 0,
    totalChunks: 0,
    folders: [],
    tags: [],
    recent: [],
    activity: [],
    heatmap: [],
    composition: { taggedNotes: 0, untaggedNotes: 0, longNotes: 0, updatedLast30: 0, updatedLast7: 0, tagCoverage: 0 },
    health: { orphans: 0, brokenLinks: 0, stale: 0, score: 100 },
    lastIndexedAt: "",
    indexMode: settings.indexMode,
    usage: emptyUsage(),
    error: extras.error ?? "",
    embedding: {
      enabled: settings.indexMode !== "keyword",
      ready: false,
      progress: 0,
      dimensions: settings.embeddingDimensions,
      model: settings.embeddingModel,
      error: ""
    },
    ...extras
  };
}

export class VaultIndex {
  constructor({ config = {}, logger = console } = {}) {
    this.logger = logger;
    this.config = config;
    this.settingsStore = null;
    this.settings = null;
    this.vaultPath = "";
    this.realVaultPath = "";
    this.dataDir = "";
    this.notes = [];
    this.chunks = [];
    this.vectors = [];
    this.vectorMask = [];
    this.files = {};
    this.postings = new Map();
    this.statsData = emptyStats(config);
    this.ready = null;
    this.building = false;
    this.buildProgress = 0;
    this.embeddingProgress = 0;
    this.embeddingError = "";
    this.initError = "";
    this.embeddingReady = false;
    this.embeddingTask = null;
    this.rebuildTask = null;
    this.disposed = false;
    this.watcher = null;
    this.watchTimer = null;
    this.queryCache = new Map();
    this.writeManager = null;
    this.usage = null;
    this._initPromise = null;
    this.abortController = new AbortController();
    this.rebuildRequested = false;
    this.indexWrites = Promise.resolve();
    this.indexWriteBarriers = new Set();
    this.saveSnapshotChain = Promise.resolve();
    this.settingsTail = Promise.resolve();
    this.embeddingGeneration = 0;
    this.indexingErrors = [];
    this.lastIndexError = "";
  }

  get vectorDimensions() {
    const first = this.vectors.find(
      (vector, index) => this.vectorMask[index] && vector instanceof Float32Array
    );
    return first?.length ?? this.settings?.embeddingDimensions ?? 0;
  }

  hasVector(index) {
    return Boolean(this.vectorMask[index] && this.vectors[index] instanceof Float32Array);
  }

  embeddedCount() {
    return this.vectorMask.reduce((count, present) => count + (present ? 1 : 0), 0);
  }

  async initialize({ force = false } = {}) {
    this.assertActive();
    if (this._initPromise && !force) return this._initPromise;
    this._initPromise = this._initialize().catch((error) => {
      this._initPromise = null;
      this.embeddingError = error instanceof Error ? error.message : String(error);
      throw error;
    });
    return this._initPromise;
  }

  async _initialize() {
    const configuredDataDir = expandHome(this.config.dataDir || "");
    this.dataDir = resolveDataDir(
      { dataDir: configuredDataDir, vaultPath: this.config.vaultPath || "" },
      configuredDataDir
    );
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    const defaults = {
      vaultPath: this.config.vaultPath || "",
      indexMode: this.config.indexMode || "hybrid"
    };
    for (const key of ["embeddingUrl", "embeddingModel", "embeddingDimensions", "embeddingApiKey", "embeddingBatchSize", "embeddingTimeoutMs", "embeddingMaxRetries", "embeddingRetryDelayMs", "autoApproveWrites", "watch", "excludedFolders", "maxChunkChars"]) {
      if (this.config[key] !== undefined) defaults[key] = this.config[key];
    }
    this.settingsStore = new SettingsStore({
      dataDir: this.dataDir,
      defaults
    });
    this.settings = await this.settingsStore.ready;
    this.vaultPath = this.settings.vaultPath ? resolve(this.settings.vaultPath) : "";
    this.writeManager = new WriteManager({
      vaultPath: this.vaultPath,
      realVaultPath: this.realVaultPath,
      dataDir: this.dataDir,
      persist: () => this.saveIndex()
    });
    this.usage = new UsageStore({ dataDir: this.dataDir });
    await this.usage.ready;

    if (!this.vaultPath) {
      this.statsData = emptyStats(this.settings);
      return this;
    }

    try {
      await this.assertVault();
      this.realVaultPath = await realpath(this.vaultPath);
      this.writeManager?.setVaultPath(this.vaultPath, this.realVaultPath);
    } catch (error) {
      this.initError = error instanceof Error ? error.message : String(error);
      this.statsData = emptyStats(this.settings, { error: this.initError });
      return this;
    }

    try {
      const loaded = await this.loadIndex();
      const changed = !loaded || await this.hasChanges();
      if (loaded && !changed) {
        this.refreshStats();
        this.startWatching();
        if (this.settings.indexMode !== "keyword" && !this.embeddingReady) this.embedPending().catch((error) => {
          if (!this.disposed) {
            this.recordIndexError("embedPending", error);
            this.refreshStats();
          }
        });
        return this;
      }
      await this.rebuild({ embed: true });
      this.startWatching();
      return this;
    } catch (error) {
      this.initError = error instanceof Error ? error.message : String(error);
      this.statsData = emptyStats(this.settings, { error: this.initError });
      this.logger.warn?.(`[vault-studio] index initialization failed: ${this.initError}`);
      return this;
    }
  }

  assertActive() {
    if (this.disposed) throw new Error("Vault service is shutting down.");
  }

  async assertVault() {
    if (!this.vaultPath) throw new Error("Vault path is not configured.");
    const info = await stat(this.vaultPath);
    if (!info.isDirectory()) throw new Error("Configured vault path is not a directory.");
  }

  async hasChanges() {
    if (!this.vaultPath) return false;
    const files = await this.scanFiles();
    const previous = this.files ?? {};
    if (Object.keys(files).length !== Object.keys(previous).length) return true;
    return Object.entries(files).some(([path, info]) => {
      const old = previous[path];
      return !old || old.mtime !== info.mtime || old.size !== info.size;
    });
  }

  excludedFolders() {
    return new Set(
      String(this.settings.excludedFolders ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }

  async scanFiles() {
    const excluded = this.excludedFolders();
    const files = {};
    const walk = async (directory) => {
      let entries;
      try {
        entries = await readdir(directory, { withFileTypes: true });
      } catch (error) {
        this.recordIndexError(toPosix(relative(this.vaultPath, directory) || "."), error);
        return;
      }
      for (const entry of entries) {
        if (entry.name.startsWith(".") || excluded.has(entry.name)) continue;
        const full = join(directory, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
          continue;
        }
        if (!entry.isFile() || !/\.md$/i.test(entry.name)) continue;
        try {
          const info = await stat(full);
          if (info.size > 3_000_000) continue;
          const path = toPosix(relative(this.vaultPath, full));
          files[path] = { mtime: info.mtimeMs, size: info.size };
        } catch (error) {
          this.recordIndexError(toPosix(relative(this.vaultPath, full)), error);
        }
      }
    };
    await walk(this.vaultPath);
    return files;
  }

  async rebuild({ embed = true } = {}) {
    if (this.building) {
      this.rebuildRequested = true;
      return this.ready;
    }
    if (!this.vaultPath) {
      this.statsData = emptyStats(this.settings || this.config);
      return this;
    }
    this.building = true;
    this.buildProgress = 0;
    this.indexingErrors = [];
    this.lastIndexError = "";
    this.embeddingError = "";
    this.initError = "";
    this.ready = (async () => {
      try {
        if (this.embeddingTask) await this.embeddingTask.catch(() => {});
        await this.assertVault();
        this.realVaultPath = await realpath(this.vaultPath);
        this.writeManager?.setVaultPath(this.vaultPath, this.realVaultPath);
        const files = await this.scanFiles();
        const paths = Object.keys(files).sort();
        const notes = [];
        const chunks = [];
        const oldVectors = new Map();
        if (this.settings.indexMode !== "keyword" && this.vectors.length === this.chunks.length) {
          this.chunks.forEach((chunk, index) => {
            // Key the cache by content hash, not chunk id: the id embeds the
            // chunk's positional index, so inserting a line mid-note shifted
            // every later id and invalidated vectors of unchanged chunks.
            if (this.hasVector(index)) oldVectors.set(chunk.hash, this.vectors[index]);
          });
        }

        for (let index = 0; index < paths.length; index += 1) {
          if (this.disposed || this.abortController.signal.aborted) return;
          const path = paths[index];
          const full = join(this.vaultPath, path);
          try {
            const raw = await readFile(full, "utf8");
            const info = files[path];
            const note = parseNote({
              path,
              raw,
              mtime: info.mtime,
              size: info.size,
              maxChunkChars: this.settings.maxChunkChars
            });
            notes.push({
              ...note,
              body: undefined
            });
            chunks.push(...note.chunks);
          } catch (error) {
            this.recordIndexError(path, error);
            this.logger.warn?.(`[vault-studio] failed to read ${path}: ${error instanceof Error ? error.message : String(error)}`);
            // Only successfully parsed files are committed to the cache. An
            // unchanged file with a transient read/parse failure must be
            // retried on the next incremental scan rather than marked done.
            delete files[path];
          }
          this.buildProgress = Math.round(((index + 1) / Math.max(1, paths.length)) * 100);
        }

        this.notes = notes;
        this.chunks = chunks;
        this.files = files;
        this.vectors = chunks.map((chunk) => oldVectors.get(chunk.hash));
        this.vectorMask = chunks.map((chunk) => oldVectors.has(chunk.hash));
        this.buildPostings();
        if (this.disposed || this.abortController.signal.aborted) return;
        this.settings.lastIndexedAt = new Date().toISOString();
        await this.settingsStore.update({ lastIndexedAt: this.settings.lastIndexedAt }).catch((error) => {
          this.recordIndexError("settings", error);
        });
        if (this.disposed || this.abortController.signal.aborted) return;
        await this.saveIndex().catch((error) => {
          // In-memory results are usable, but a failed snapshot is a visible
          // indexing error and the next write/scan gets a chance to retry.
          if (!this.disposed) this.recordIndexError("index.json", error);
        });
        this.embeddingReady =
          chunks.length === 0 ||
          this.settings.indexMode === "keyword" ||
          this.embeddedCount() === chunks.length;
        this.embeddingProgress = chunks.length
          ? Math.round((this.embeddedCount() / chunks.length) * 100)
          : 100;
        this.refreshStats();
      } finally {
        this.building = false;
      }
      if (this.disposed) return this;
      if (embed && this.settings.indexMode !== "keyword") {
        // A rebuild may join a run that was already embedding the same vault
        // snapshot (including an updateSettings rebuild). Share that run rather
        // than clearing its progress and starting a duplicate request chain,
        // especially when the configured endpoint is unavailable.
        if (!this.embeddingTask) {
          this.embedPending().catch((error) => {
            if (!this.disposed) {
              this.recordIndexError("embedPending", error);
              this.refreshStats();
            }
          });
        }
      }
      return this;
    })();
    this.trackIndexWrite(this.ready);
    try {
      await this.ready;
    } finally {
      this.ready = null;
    }
    // A write or filesystem change arrived during the previous scan. Do not
    // discard it behind a completed stale snapshot. Each waiter receives that
    // follow-up rescan when it occurs during its own await.
    if (this.rebuildRequested && !this.disposed) {
      this.rebuildRequested = false;
      return this.rebuild({ embed });
    }
    this.rebuildRequested = false;
    return this;
  }

  buildPostings() {
    this.postings = new Map();
    this.chunks.forEach((chunk, index) => {
      const counts = new Map();
      for (const token of tokenize(chunk.searchText)) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
      }
      for (const [token, count] of counts) {
        let postings = this.postings.get(token);
        if (!postings) {
          postings = new Map();
          this.postings.set(token, postings);
        }
        postings.set(index, count);
      }
    });
    this.vocabulary = [...this.postings.keys()];
  }

  /**
   * Embed one batch with a retry, then bisect on persistent failure so a
   * single rejected text (gateway content filters drop the connection for
   * patterns like `$ curl ...` or `prompt (...)` inside technical notes)
   * cannot abort the whole embedding run. Rejected texts resolve to `null`
   * and stay unvectorized; everything else is embedded normally.
   */
  async embedBatchWithIsolation(batch) {
    const texts = () => batch.map((item) => item.chunk.searchText || item.chunk.text);
    let lastError = null;
    const maxRetries = Math.max(1, Math.min(11, (Number(this.settings.embeddingMaxRetries) ?? 3) + 1));
    const retryDelay = Math.max(0, Math.min(60_000, Number(this.settings.embeddingRetryDelayMs) ?? 250));
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        return await embedTexts(this.settings, texts(), this.abortController.signal);
      } catch (error) {
        lastError = error;
        if (this.disposed || this.abortController.signal.aborted) throw error;
        if (attempt < maxRetries && retryDelay) {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, retryDelay * attempt);
            this.abortController.signal.addEventListener("abort", () => {
              clearTimeout(timer);
              reject(this.abortController.signal.reason || new Error("Embedding run was cancelled."));
            }, { once: true });
          });
        }
      }
    }
    if (batch.length === 1) {
      this.logger?.warn?.(
        `[vault-studio] embedding service keeps rejecting chunk ${batch[0].chunk.id} (${batch[0].chunk.notePath}); skipping it`
      );
      return [null];
    }
    const mid = Math.ceil(batch.length / 2);
    const halves = [batch.slice(0, mid), batch.slice(mid)];
    const vectors = [];
    for (const half of halves) {
      vectors.push(...(await this.embedBatchWithIsolation(half)));
    }
    return vectors;
  }

  async embedPending() {
    if (this.disposed || this.abortController.signal.aborted) return [];
    if (this.embeddingTask) return this.embeddingTask;
    if (!this.settings || this.settings.indexMode === "keyword") return [];
    if (!this.settings.embeddingUrl) {
      this.embeddingError = "Embedding service URL is not configured.";
      this.refreshStats();
      return [];
    }
    this.embeddingTask = this.trackIndexWrite((async () => {
      let skipped = 0;
      try {
        const pending = [];
        this.chunks.forEach((chunk, index) => {
          if (!this.hasVector(index)) pending.push({ chunk, index });
        });
        if (!pending.length) {
          this.embeddingReady = this.chunks.length === 0 || this.embeddedCount() === this.chunks.length;
          this.embeddingProgress = this.chunks.length
            ? Math.round((this.embeddedCount() / this.chunks.length) * 100)
            : 100;
          this.refreshStats();
          return;
        }
        this.embeddingReady = false;
        this.embeddingError = "";
        const batchSize = Math.max(1, Math.min(128, Number(this.settings.embeddingBatchSize) || 24));
        for (let index = 0; index < pending.length; index += batchSize) {
          if (this.disposed || this.abortController.signal.aborted) return;
          const batch = pending.slice(index, index + batchSize);
          const vectors = await this.embedBatchWithIsolation(batch);
          for (let offset = 0; offset < batch.length; offset += 1) {
            const vector = vectors[offset];
            if (vector === null) {
              // The embedding service permanently rejected this text (e.g. a
              // gateway-side content filter). Leave it unvectorized instead of
              // aborting the whole embedding run.
              skipped += 1;
              continue;
            }
            if (!Array.isArray(vector) || !vector.length) throw new Error("Embedding service returned an empty vector.");
            if (
              this.settings.embeddingDimensions > 0 &&
              vector.length !== this.settings.embeddingDimensions
            ) {
              throw new Error(
                `Embedding dimension mismatch: configured ${this.settings.embeddingDimensions}, received ${vector.length}.`
              );
            }
            if (this.disposed || this.abortController.signal.aborted) return;
            this.vectors[batch[offset].index] = Float32Array.from(vector);
            this.vectorMask[batch[offset].index] = true;
          }
          this.embeddingProgress = this.chunks.length
            ? Math.round((this.embeddedCount() / this.chunks.length) * 100)
            : 100;
          if (this.disposed) return;
          if (index === 0 || (index / batchSize) % 8 === 0 || index + batch.length >= pending.length) {
            await this.saveIndex();
          }
        }
        this.embeddingReady = this.chunks.length === 0 || this.embeddedCount() === this.chunks.length;
        this.embeddingProgress = this.chunks.length
          ? Math.round((this.embeddedCount() / this.chunks.length) * 100)
          : 100;
        if (skipped) {
          this.embeddingError = `${skipped} chunk${skipped === 1 ? "" : "s"} could not be embedded and remain searchable by keywords only.`;
        }
        this.refreshStats();
        await this.saveIndex();
      } catch (error) {
        if (this.disposed || this.abortController.signal.aborted) return;
        this.embeddingError = error instanceof Error ? error.message : String(error);
        this.embeddingReady = false;
        this.refreshStats();
      } finally {
        this.embeddingTask = null;
      }
    })());
    return this.embeddingTask;
  }

  async settleBackgroundIndex() {
    let rebuild = this.rebuildTask || this.ready;
    if (rebuild) await rebuild.catch(() => {});
    let embedding = this.embeddingTask;
    while (embedding) {
      await embedding.catch(() => {});
      await this.indexWrites;
      if (this.building) {
        const followUp = this.ready;
        if (followUp) await followUp.catch(() => {});
      }
      embedding = this.embeddingTask;
    }
    await this.indexWrites;
    const status = this.status();
    return status.indexingError || this.embeddingError || "";
  }

  refreshStats() {
    const notes = this.notes;
    const tagCounts = new Map();
    const folderCounts = new Map();
    const inbound = new Map(notes.map((note) => [note.path, new Set()]));
    const keyMap = new Map();
    for (const note of notes) {
      const keys = [
        noteKey(note.path),
        noteKey(note.path.replace(/\.md$/i, "")),
        noteKey(note.title),
        noteKey(note.path.split("/").pop() ?? "")
      ];
      for (const key of keys) if (key) keyMap.set(key, note.path);
      folderCounts.set(note.folder, (folderCounts.get(note.folder) ?? 0) + 1);
      for (const tag of note.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }

    let brokenLinks = 0;
    for (const note of notes) {
      for (const link of note.links) {
        const target = keyMap.get(noteKey(link));
        if (!target) {
          brokenLinks += 1;
          continue;
        }
        inbound.get(target)?.add(note.path);
      }
    }

    const now = Date.now();
    const taggedNotes = notes.filter((note) => note.tags.length > 0).length;
    const composition = {
      taggedNotes,
      untaggedNotes: notes.length - taggedNotes,
      longNotes: notes.filter((note) => note.words >= 2000).length,
      updatedLast30: notes.filter((note) => now - note.mtime <= 30 * 86_400_000).length,
      updatedLast7: notes.filter((note) => now - note.mtime <= 7 * 86_400_000).length,
      tagCoverage: notes.length ? Math.round((taggedNotes / notes.length) * 100) : 0
    };
    const stale = notes.filter((note) => now - note.mtime > 90 * 86_400_000).length;
    const orphans = notes.filter((note) => (inbound.get(note.path)?.size ?? 0) === 0 && note.links.length === 0).length;
    const activity = [];
    const activityMap = new Map();
    for (let offset = 13; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = dateKey(date);
      activityMap.set(key, 0);
      activity.push({ date: key, count: 0 });
    }
    for (const note of notes) {
      const key = dateKey(note.mtime);
      if (activityMap.has(key)) activityMap.set(key, activityMap.get(key) + 1);
    }
    for (const point of activity) point.count = activityMap.get(point.date) ?? 0;

    const score = Math.max(
      0,
      Math.min(100, Math.round(100 - orphans * 1.4 - brokenLinks * 1.8 - stale * 0.15))
    );
    const heatmap = [];
    const heatmapCounts = new Map();
    for (let offset = 364; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const key = dateKey(date);
      heatmapCounts.set(key, 0);
      heatmap.push({ date: key, count: 0, level: 0 });
    }
    for (const note of notes) {
      const key = dateKey(note.mtime);
      if (heatmapCounts.has(key)) heatmapCounts.set(key, heatmapCounts.get(key) + 1);
    }
    const heatmapMax = Math.max(1, ...heatmapCounts.values());
    for (const day of heatmap) {
      day.count = heatmapCounts.get(day.date) ?? 0;
      day.level = day.count === 0 ? 0 : 1 + Math.min(3, Math.floor((day.count / heatmapMax) * 3));
    }

    const recent = [...notes]
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 8)
      .map((note) => ({
        path: note.path,
        title: note.title,
        folder: note.folder,
        tags: note.tags,
        words: note.words,
        mtime: note.mtime
      }));
    const folders = [...folderCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const tags = [...tagCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 24);

    this.statsData = {
      configured: Boolean(this.vaultPath),
      vaultPath: this.vaultPath,
      totalNotes: notes.length,
      totalWords: notes.reduce((sum, note) => sum + note.words, 0),
      totalTags: tagCounts.size,
      totalLinks: notes.reduce((sum, note) => sum + note.links.length, 0),
      totalChunks: this.chunks.length,
      folders,
      tags,
      recent,
      activity,
      heatmap,
      composition,
      health: { orphans, brokenLinks, stale, score },
      lastIndexedAt: this.settings?.lastIndexedAt ?? "",
      indexMode: this.settings?.indexMode ?? "hybrid",
      usage: this.usage?.summary() ?? emptyUsage(),
      error: this.initError || this.embeddingError || this.lastIndexError || "",
      embedding: {
        enabled: (this.settings?.indexMode ?? "hybrid") !== "keyword",
        ready: this.embeddingReady,
        progress: this.embeddingProgress,
        dimensions: this.vectorDimensions,
        model: this.settings?.embeddingModel ?? "",
        error: this.embeddingError
      }
    };
    return this.statsData;
  }

  stats() {
    return this.statsData;
  }

  recordIndexError(operation, error) {
    const message = error instanceof Error ? error.message : String(error);
    const entry = { path: String(operation), error: message };
    this.indexingErrors = [...this.indexingErrors.filter((item) => item.path !== entry.path), entry].slice(-100);
    this.lastIndexError = `${entry.path}: ${entry.error}`;
    return entry;
  }

  async recordUsage(tool) {
    if (!this.usage) return;
    await this.usage.record(tool);
    this.refreshStats();
  }

  usageSummary() {
    return this.usage?.summary() ?? emptyUsage();
  }

  status() {
    let firstPendingChunk = null;
    if (this.settings.indexMode !== "keyword") {
      const index = this.chunks.findIndex((_chunk, position) => !this.hasVector(position));
      if (index >= 0) {
        const chunk = this.chunks[index];
        firstPendingChunk = { id: chunk.id, notePath: chunk.notePath };
      }
    }
    return {
      building: this.building,
      buildProgress: this.buildProgress,
      embeddingReady: this.embeddingReady,
      embeddingProgress: this.embeddingProgress,
      embeddingError: this.embeddingError,
      indexingError: this.lastIndexError,
      indexingErrors: this.indexingErrors.map((entry) => ({ ...entry })),
      chunks: this.chunks.length,
      vectors: this.embeddedCount(),
      pending: Math.max(0, this.chunks.length - this.embeddedCount()),
      firstPendingChunk
    };
  }

  filterChunkIndices(folders, tags) {
    const folderSet = new Set(folders ?? []);
    const tagSet = new Set(tags ?? []);
    if (!folderSet.size && !tagSet.size) return null;
    const notes = new Map(this.notes.map((note) => [note.path, note]));
    const allowed = new Set();
    this.chunks.forEach((chunk, index) => {
      const note = notes.get(chunk.notePath);
      if (!note) return;
      if (folderSet.size && !folderSet.has(note.folder)) return;
      if (tagSet.size && !note.tags.some((tag) => tagSet.has(tag))) return;
      allowed.add(index);
    });
    return allowed;
  }

  keywordScores(query, allowed) {
    const raw = query.trim().toLowerCase();
    const queryTokens = tokenize(query);
    // Latin tokens need a one-character prefix too; the index itself only
    // stores tokens of length 2+, so keep the raw token for the prefix pass.
    if (raw && /^[a-z0-9_]+$/.test(raw)) queryTokens.push(raw);
    const tokens = unique(queryTokens).slice(0, 40);
    if (!tokens.length) return [];
    const scores = new Map();
    const total = Math.max(1, this.chunks.length);
    const vocabulary = this.vocabulary ?? [...this.postings.keys()];
    const addPostings = (postings, weight) => {
      const idf = Math.log(1 + total / postings.size);
      for (const [index, count] of postings) {
        if (allowed && !allowed.has(index)) continue;
        scores.set(index, (scores.get(index) ?? 0) + weight * idf * (1 + Math.log(count)));
      }
    };
    for (const token of tokens) {
      const exact = this.postings.get(token);
      if (exact) addPostings(exact, 1);
      // Prefix retrieval makes type-ahead useful: "ret" finds "retrieval",
      // "obs" finds "obsidian", etc. CJK single characters are already exact
      // tokens, so this pass is intentionally limited to Latin-style tokens.
      if (!/^[a-z0-9_]+$/.test(token)) continue;
      let expanded = 0;
      for (const candidate of vocabulary) {
        if (candidate === token || !candidate.startsWith(token)) continue;
        const postings = this.postings.get(candidate);
        if (!postings) continue;
        addPostings(postings, 0.55);
        expanded += 1;
        if (expanded >= 40) break;
      }
    }
    const phrase = query.trim().toLowerCase();
    if (phrase) {
      for (const [index, score] of scores) {
        if (this.chunks[index]?.searchText.toLowerCase().includes(phrase)) {
          scores.set(index, score + 4);
        }
      }
    }
    return [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80);
  }

  async queryVector(query, signal) {
    const generation = this.embeddingGeneration;
    const settings = this.settings;
    const cached = this.queryCache.get(query);
    if (cached) return cached;
    if (!settings.embeddingUrl) return null;
    try {
      const [vector] = await embedTexts(settings, [query], signal);
      if (generation !== this.embeddingGeneration) return this.queryVector(query, signal);
      const typed = Float32Array.from(vector);
      this.queryCache.set(query, typed);
      while (this.queryCache.size > 50) this.queryCache.delete(this.queryCache.keys().next().value);
      this.embeddingError = "";
      return typed;
    } catch (error) {
      if (generation !== this.embeddingGeneration) return this.queryVector(query, signal);
      if (signal?.aborted || this.disposed || this.abortController.signal.aborted) {
        throw signal?.reason || this.abortController.signal.reason || error;
      }
      this.embeddingError = error instanceof Error ? error.message : String(error);
      return null;
    }
  }

  semanticScores(queryVector, allowed) {
    if (!queryVector) return [];
    const scores = [];
    for (let index = 0; index < this.chunks.length; index += 1) {
      if (allowed && !allowed.has(index)) continue;
      if (!this.hasVector(index)) continue;
      const vector = this.vectors[index];
      if (!(vector instanceof Float32Array) || vector.length !== queryVector.length) continue;
      let score = 0;
      for (let dimension = 0; dimension < vector.length; dimension += 1) {
        score += vector[dimension] * queryVector[dimension];
      }
      scores.push([index, score]);
    }
    return scores.sort((a, b) => b[1] - a[1]).slice(0, 80);
  }

  combineScores(keyword, semantic) {
    const rrf = new Map();
    for (const [rank, [index]] of keyword.entries()) {
      rrf.set(index, (rrf.get(index) ?? 0) + 1 / (60 + rank + 1));
    }
    for (const [rank, [index]] of semantic.entries()) {
      rrf.set(index, (rrf.get(index) ?? 0) + 1 / (60 + rank + 1));
    }
    return [...rrf.entries()].sort((a, b) => b[1] - a[1]);
  }

  async search({ query = "", mode, limit = DEFAULT_LIMIT, folders = [], tags = [] } = {}, signal) {
    this.assertActive();
    await this.initialize();
    this.assertActive();
    signal?.throwIfAborted();
    const selectedMode = ["hybrid", "semantic", "keyword"].includes(mode)
      ? mode
      : this.settings.indexMode;
    const queryText = String(query ?? "").trim();
    const max = clamp(limit, 1, 50, DEFAULT_LIMIT);
    const allowed = this.filterChunkIndices(
      Array.isArray(folders) ? folders.map(String) : [],
      Array.isArray(tags) ? tags.map(String) : []
    );
    const warning = [];
    let keyword = [];
    let semantic = [];
    let queryVector = null;

    signal?.throwIfAborted();
    if (queryText) {
      const keywordCandidates = this.keywordScores(queryText, allowed);
      keyword = selectedMode === "semantic" ? [] : keywordCandidates;
      if (selectedMode !== "keyword") {
        queryVector = await this.queryVector(queryText, signal);
        if (!queryVector && selectedMode === "hybrid") {
          keyword = keywordCandidates;
          warning.push(`Semantic component unavailable; keyword-only results. ${this.embeddingError || ""}`.trim());
        } else if (queryVector) {
          semantic = this.semanticScores(queryVector, allowed);
          if (selectedMode === "hybrid" && !semantic.length) {
            keyword = keywordCandidates;
            warning.push("No matching semantic vectors; keyword results are shown.");
          }
        }
        // An explicitly semantic request never silently switches to keyword:
        // during indexing or transport failure, return no results and explain
        // why instead of presenting keyword hits as semantic matches.
        if (!queryVector && selectedMode === "semantic") {
          warning.push(`Semantic search unavailable. ${this.embeddingError || "Embeddings are still indexing; try again later."}`.trim());
        }
      }
    } else {
      const noteTimes = new Map(this.notes.map((note) => [note.path, note.mtime]));
      const recent = this.chunks
        .map((chunk, index) => ({ chunk, index, mtime: noteTimes.get(chunk.notePath) ?? 0 }))
        .filter((item) => !allowed || allowed.has(item.index))
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, max * 3);
      keyword = recent.map((item, index) => [item.index, 1 / (index + 1)]);
    }

    const combined = queryText
      ? this.combineScores(keyword, semantic)
      : keyword;
    const notes = new Map(this.notes.map((note) => [note.path, note]));
    const results = [];
    const perNote = new Map();
    const maxScore = combined[0]?.[1] ?? 1;
    for (const [index, score] of combined) {
      const chunk = this.chunks[index];
      const note = notes.get(chunk.notePath);
      if (!note) continue;
      if ((perNote.get(note.path) ?? 0) >= 2) continue;
      perNote.set(note.path, (perNote.get(note.path) ?? 0) + 1);
      results.push({
        id: chunk.id,
        notePath: note.path,
        title: note.title,
        headingPath: chunk.headingPath,
        snippet: snippetAround(chunk.text, queryText),
        score: Number((score / maxScore).toFixed(3)),
        matchedBy: [
          keyword.some(([candidate]) => candidate === index) ? "keyword" : "",
          semantic.some(([candidate]) => candidate === index) ? "vector" : ""
        ].filter(Boolean),
        line: chunk.startLine,
        tags: note.tags,
        mtime: note.mtime
      });
      if (results.length >= max) break;
    }

    return {
      query: queryText,
      mode: selectedMode,
      total: results.length,
      warning: warning.join(" "),
      results
    };
  }

  async listNotes({ query = "", folder = "", limit = 50 } = {}) {
    await this.initialize();
    this.assertActive();
    const text = String(query).trim().toLowerCase();
    return [...this.notes]
      .filter((note) => (!folder || note.folder === folder) && (!text || `${note.title} ${note.path} ${note.tags.join(" ")}`.toLowerCase().includes(text)))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, Math.floor(clamp(limit, 1, 200, 50)))
      .map((note) => ({
        path: note.path,
        title: note.title,
        folder: note.folder,
        tags: note.tags,
        words: note.words,
        mtime: note.mtime,
        links: note.links.length
      }));
  }

  async readNote(notePath, signal) {
    await this.initialize();
    this.assertActive();
    if (!this.vaultPath) throw new Error("Vault path is not configured.");
    const normalized = toPosix(String(notePath ?? "")).replace(/^\/+/, "");
    const full = resolve(this.vaultPath, normalized);
    if (!isInside(this.vaultPath, full) || !/\.md$/i.test(full)) {
      throw new Error("Note path must point inside the vault and end with .md.");
    }
    signal?.throwIfAborted();
    const canonical = await realpath(full);
    if (!isInside(this.realVaultPath || this.vaultPath, canonical)) {
      throw new Error("Note path resolves outside the configured vault.");
    }
    const info = await stat(full);
    if (info.size > 3_000_000) throw new Error("Note is larger than the 3 MB indexing limit.");
    signal?.throwIfAborted();
    const raw = await readFile(full, "utf8");
    const note = parseNote({
      path: toPosix(relative(this.vaultPath, full)),
      raw,
      mtime: info.mtimeMs,
      size: info.size,
      maxChunkChars: this.settings.maxChunkChars
    });
    return {
      path: note.path,
      title: note.title,
      folder: note.folder,
      tags: note.tags,
      aliases: note.aliases,
      links: note.links,
      headings: note.headings,
      frontmatter: note.frontmatter,
      content: note.body,
      words: note.words,
      mtime: note.mtime,
      size: note.size
    };
  }

  async proposeWrite(request) {
    await this.initialize();
    return this.writeManager.propose(request);
  }

  async applyWrite(proposalId) {
    this.assertActive();
    await this.initialize();
    this.assertActive();
    return this.writeManager.apply(proposalId);
  }

  async undoWrite(undoId) {
    this.assertActive();
    await this.initialize();
    this.assertActive();
    return this.writeManager.undo(undoId);
  }

  proposals() {
    return this.writeManager?.listProposals() ?? [];
  }

  proposalFor(id) {
    return this.writeManager?.proposalFor(id) ?? null;
  }

  undoFor(id) {
    return this.writeManager?.undoFor(id) ?? null;
  }

  async getSettings() {
    await this.initialize();
    return this.settingsStore.publicSettings;
  }

  async updateSettings(patch = {}) {
    const operation = this.settingsTail.then(() => this.commitSettings(patch));
    this.settingsTail = operation.catch(() => {});
    return operation;
  }

  async commitSettings(patch) {
    await this.initialize();
    this.assertActive();
    const before = { ...this.settings };
    const next = await this.settingsStore.update(patch);
    this.settings = next;
    if (["embeddingUrl", "embeddingModel", "embeddingDimensions", "embeddingApiKey"].some(
      (key) => before[key] !== next[key]
    )) this.embeddingGeneration += 1;
    this.queryCache.clear();
    this.vaultPath = next.vaultPath ? resolve(next.vaultPath) : "";
    this.realVaultPath = "";
    this.writeManager?.setVaultPath(this.vaultPath, this.realVaultPath);
    const meaningfulKeys = new Set([
      "vaultPath", "watch", "indexMode", "embeddingUrl", "embeddingModel",
      "embeddingDimensions", "embeddingApiKey", "embeddingBatchSize",
      "embeddingTimeoutMs", "embeddingMaxRetries", "embeddingRetryDelayMs",
      "excludedFolders", "maxChunkChars"
    ]);
    const hasChanges = Object.keys(next).some((key) => meaningfulKeys.has(key) && before[key] !== next[key]);
    const needsRebuild =
      before.vaultPath !== next.vaultPath ||
      before.indexMode !== next.indexMode ||
      before.embeddingUrl !== next.embeddingUrl ||
      before.embeddingModel !== next.embeddingModel ||
      before.embeddingDimensions !== next.embeddingDimensions ||
      before.excludedFolders !== next.excludedFolders ||
      before.maxChunkChars !== next.maxChunkChars;
    if (!hasChanges) return this.settingsStore.publicSettings;
    if (!this.vaultPath || before.vaultPath !== next.vaultPath) {
      this.notes = [];
      this.chunks = [];
      this.vectors = [];
      this.vectorMask = [];
      this.files = {};
      this.statsData = emptyStats(next);
    }
    if (before.vaultPath !== next.vaultPath || before.watch !== next.watch) this.startWatching();
    if (needsRebuild) {
      // Saving settings must return immediately. Clearing the vector store and
      // re-embedding can take minutes; the UI observes progress through
      // indexStatus instead of holding the save request open.
      const previousEmbedding = this.embeddingTask;
      this.embeddingReady = false;
      this.embeddingProgress = 0;
      // Publish the task synchronously. Starting in an async continuation
      // creates a window where the next update also sees rebuildTask=null.
      // Capture predecessors synchronously, before awaiting the embedding task;
      // a later update may already own the shared rebuildTask by then.
      const previousRebuild = this.rebuildTask;
      const task = (async () => {
        if (previousEmbedding) await previousEmbedding.catch(() => {});
        if (previousRebuild) await previousRebuild.catch(() => {});
        if (this.disposed) return;
        this.vectors = [];
        this.vectorMask = [];
        await this.startWatching();
        await this.rebuild({ embed: true });
        // A different update may have waited for this task and queued a
        // follow-up before this code clears its handle. Do not clear that
        // newer task or lose its required rescan.
        if (this.rebuildRequested && !this.disposed && !this.building) {
          this.rebuildRequested = false;
          await this.rebuild({ embed: true });
        }
      })().catch((error) => {
        this.initError = error instanceof Error ? error.message : String(error);
        this.statsData = emptyStats(this.settings, { error: this.initError });
      });
      // Install synchronously before awaiting the legacy task: otherwise two
      // immediate calls both see null and run independent complete scans.
      this.rebuildTask = task;
      task.finally(() => {
        if (this.rebuildTask === task) this.rebuildTask = null;
      });
    }
    return this.settingsStore.publicSettings;
  }

  async testEmbedding(settingsOverride, signal) {
    await this.initialize();
    const { embeddingApiKey, ...override } = settingsOverride || {};
    const settings = {
      ...this.settings,
      ...override,
      embeddingApiKey: typeof embeddingApiKey === "string" && embeddingApiKey ? embeddingApiKey : this.settings.embeddingApiKey
    };
    return testEmbedding(settings, signal);
  }

  async reindex() {
    await this.initialize();
    this.rebuild({ embed: true }).catch((error) => {
      this.recordIndexError("reindex", error);
      this.refreshStats();
    });
    return { started: true };
  }

  startWatching() {
    this.stopWatching();
    if (!this.settings?.watch || !this.vaultPath) return;
    try {
      this.watcher = watch(this.vaultPath, { recursive: true }, (event, filename) => {
        if (!filename || !/\.md$/i.test(String(filename))) return;
        clearTimeout(this.watchTimer);
        this.watchTimer = setTimeout(() => {
          this.rebuild({ embed: true }).catch((error) => {
            this.recordIndexError("watch", error);
            this.refreshStats();
          });
        }, 1800);
        this.watchTimer.unref?.();
      });
    } catch (error) {
      this.logger.warn?.(`[vault-studio] file watching is unavailable: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  stopWatching() {
    try {
      this.watcher?.close();
    } catch {
      // ignore
    }
    this.watcher = null;
    if (this.watchTimer) clearTimeout(this.watchTimer);
    this.watchTimer = null;
  }

  trackIndexWrite(promise) {
    const tracked = Promise.resolve(promise);
    this.indexWriteBarriers.add(tracked);
    tracked.finally(() => this.indexWriteBarriers.delete(tracked)).catch(() => {});
    return tracked;
  }

  queueIndexWrite(operation) {
    const result = this.saveSnapshotChain.then(() => {
      // An already-started write may finish atomically, but unload must never
      // schedule a later trailing save behind the close barrier.
      if (this.disposed) return;
      return operation();
    });
    this.saveSnapshotChain = result.catch(() => {});
    return this.trackIndexWrite(result);
  }

  saveIndex() {
    return this.queueIndexWrite(() => this.saveIndexSnapshot());
  }

  async saveIndexSnapshot() {
    if (!this.dataDir) return;
    // Capture chunks and vectors together into a private snapshot before any
    // async I/O. A later rebuild cannot splice unrelated index/vector files.
    const chunks = this.chunks.slice();
    const vectorMask = this.vectorMask.slice();
    const vectors = this.vectors.map((vector, index) => vectorMask[index] ? vector?.slice() : undefined);
    const files = this.files;
    const notes = this.notes;
    const dimensions = vectors.find((vector) => vector instanceof Float32Array)?.length ?? 0;
    const embedded = vectorMask.reduce((count, value, i) => count + (value && vectors[i] instanceof Float32Array ? 1 : 0), 0);
    const index = {
      version: INDEX_VERSION,
      vaultPath: this.vaultPath,
      generatedAt: new Date().toISOString(),
      settings: {
        indexMode: this.settings.indexMode,
        embeddingModel: this.settings.embeddingModel,
        excludedFolders: this.settings.excludedFolders,
        maxChunkChars: this.settings.maxChunkChars
      },
      files: files ?? {},
      notes: notes.map(({ chunks, body, ...note }) => note),
      chunks,
      vectorMask: chunks.map((chunk, i) => Boolean(vectorMask[i] && vectors[i] instanceof Float32Array)),
      vectorCount: embedded,
      dimensions
    };
    // Write both files to a temp path first and rename over the target, so a
    // crash mid-save cannot leave a truncated index.json (which loadIndex()
    // treats as invalid and discards, triggering a full re-embed). index.json
    // is committed last: it is the marker that the matching vectors.bin is
    // complete.
    // Snapshot the first file before yielding: a later rebuild may replace
    // chunks of a different dimension before this file reaches rename().
    const serialized = await this.serializeVectors(dimensions, chunks, vectors);
    await this.writeAtomic(join(this.dataDir, "vectors.bin"), () => serialized);
    if (this.disposed) return;
    await this.writeAtomic(join(this.dataDir, "index.json"), () => JSON.stringify(index));
  }

  async serializeVectors(dimensions, chunks = this.chunks, vectors = this.vectors) {
    if (dimensions > 0 && chunks.length > 0) {
      const buffer = Buffer.alloc(chunks.length * dimensions * 4);
      let offset = 0;
      for (let index = 0; index < chunks.length; index += 1) {
        const vector = vectors[index];
        if (vector instanceof Float32Array) {
          if (vector.length !== dimensions) throw new Error("Vector dimensions changed within one snapshot.");
          for (const value of vector) {
            buffer.writeFloatLE(value, offset);
            offset += 4;
          }
        } else {
          offset += dimensions * 4;
        }
      }
      return buffer;
    }
    return Buffer.alloc(0);
  }

  async writeAtomic(targetPath, produce) {
    const tmpPath = `${targetPath}.tmp-${randomUUID()}`;
    const payload = await produce();
    await writeFile(tmpPath, payload, { mode: 0o600 });
    await rename(tmpPath, targetPath);
  }

  async loadIndex() {
    try {
      const index = JSON.parse(await readFile(join(this.dataDir, "index.json"), "utf8"));
      if (index.version !== INDEX_VERSION || index.vaultPath !== this.vaultPath) return false;
      const indexed = index.settings ?? {};
      if (
        indexed.excludedFolders !== this.settings.excludedFolders ||
        indexed.maxChunkChars !== this.settings.maxChunkChars
      ) {
        return false;
      }
      if (
        this.settings.indexMode !== "keyword" &&
        Number(index.vectorCount) > 0 &&
        (indexed.embeddingModel !== this.settings.embeddingModel ||
          (Number(this.settings.embeddingDimensions) > 0 &&
            Number(index.dimensions) !== Number(this.settings.embeddingDimensions)))
      ) {
        return false;
      }
      this.files = index.files ?? {};
      this.notes = Array.isArray(index.notes) ? index.notes : [];
      this.chunks = Array.isArray(index.chunks) ? index.chunks : [];
      this.buildPostings();
      this.vectors = this.chunks.map(() => undefined);
      this.vectorMask = this.chunks.map(() => false);
      const dimensions = Number(index.dimensions) || 0;
      const mask = Array.isArray(index.vectorMask)
        ? index.vectorMask
        : this.chunks.map(() => true);
      if (dimensions > 0 && Number(index.vectorCount) > 0) {
        try {
          const buffer = await readFile(join(this.dataDir, "vectors.bin"));
          const expected = this.chunks.length * dimensions * 4;
          if (buffer.length >= expected) {
            // View the buffer directly: one Float32Array over the whole file
            // (4-byte aligned by construction) instead of chunks.length ×
            // dimensions readFloatLE calls — for 32k chunks at 4096 dims that
            // is 131M function calls per session startup.
            for (let indexOffset = 0; indexOffset < this.chunks.length; indexOffset += 1) {
              if (!mask[indexOffset]) continue;
              const start = indexOffset * dimensions * 4;
              if (start + dimensions * 4 > buffer.length) break;
              // The index/vector save protocol writes vectors.bin first and
              // index.json last. If this buffer aliases an in-flight read or
              // save, make a private copy to avoid a torn typed-array view.
              const vector = new Float32Array(dimensions);
              vector.set(new Float32Array(buffer.buffer, buffer.byteOffset + start, dimensions));
              this.vectors[indexOffset] = vector;
              this.vectorMask[indexOffset] = true;
            }
            const loaded = this.vectors.filter((vector) => vector instanceof Float32Array).length;
            if (loaded !== Number(index.vectorCount)) throw new Error("Persisted vector count does not match vectors.bin.");
          } else {
            throw new Error("vectors.bin is shorter than the index metadata.");
          }
        } catch {
          this.vectors = this.chunks.map(() => undefined);
          this.vectorMask = this.chunks.map(() => false);
        }
      }
      this.vectorMask = this.vectors.map((vector) => vector instanceof Float32Array);
      this.embeddingReady =
        this.settings.indexMode === "keyword" || this.embeddedCount() === this.chunks.length;
      this.embeddingProgress = this.chunks.length
        ? Math.round((this.embeddedCount() / this.chunks.length) * 100)
        : 100;
      this.refreshStats();
      return true;
    } catch {
      return false;
    }
  }

  async dispose() {
    if (this.disposePromise) return this.disposePromise;
    this.disposed = true;
    this.abortController.abort(new Error("Vault service is shutting down."));
    this.stopWatching();
    this.queryCache.clear();
    this.disposePromise = (async () => {
      const initial = this._initPromise?.catch(() => {});
      await (initial || this.writeManager?.flush() || Promise.resolve());
      // Collect the full dynamic task graph. A build or storage-save promise
      // may finish and clear its earlier handle while close is waiting.
      await Promise.allSettled([
        this.ready,
        this.rebuildTask,
        this.embeddingTask,
        ...this.indexWriteBarriers
      ]);
      while (this.rebuildTask || this.embeddingTask || this.indexWriteBarriers.size) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        await Promise.allSettled([
          this.rebuildTask,
          this.embeddingTask,
          ...this.indexWriteBarriers
        ]);
      }
      await this.writeManager?.flush().catch(() => {});
    })();
    return this.disposePromise;
  }
}

export { INDEX_VERSION };
