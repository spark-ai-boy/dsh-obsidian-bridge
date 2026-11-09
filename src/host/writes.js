import { randomUUID } from "node:crypto";
import { access, chmod, mkdir, open, readFile, readdir, realpath, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { sha1 } from "./markdown.js";

const MAX_CONTENT = 200_000;
const BACKUP_VERSION = 2;
const MAX_RESTORED_BACKUPS = 1000;

function normalizeVaultPath(value) {
  const text = String(value ?? "").replace(/\\/g, "/").trim().replace(/^\.\/+/, "");
  if (!text) return "";
  if (text.startsWith("/") || /^[A-Za-z]:\//.test(text)) throw new Error("Target path must be relative to the vault.");
  const parts = text.split("/");
  if (parts.some((part) => part === ".." || part === "")) throw new Error("Target path must not contain empty segments or '..'.");
  if (/\.md$/i.test(text)) return text;
  if (/\.[A-Za-z0-9_-]+$/.test(text.slice(text.lastIndexOf("/") + 1))) throw new Error("Only Markdown (.md) notes can be written.");
  return `${text}.md`;
}

function resolveInside(root, relativePath) {
  const full = resolve(root, relativePath);
  const relation = relative(root, full);
  if (relation.startsWith("..") || isAbsolute(relation)) throw new Error("Target path escapes the configured vault.");
  return full;
}

function buildDiff(before, content, operation) {
  // The added content is at most MAX_CONTENT, so no truncation is necessary.
  // Approval must never hide a tail which could contain destructive instructions
  // or unintended content. normalizeNewlines only mirrors the eventual write.
  const added = content.split(/\r?\n/).map((line) => `+ ${line}`);
  if (operation === "create") {
    return `--- /dev/null\n+++ new note\n@@\n${added.join("\n")}`;
  }
  const tail = before.trimEnd().split(/\r?\n/).slice(-4).map((line) => `  ${line}`);
  return `--- existing note\n+++ existing note\n@@ append @@\n${tail.join("\n")}\n${added.join("\n")}`;
}

function isInside(root, candidate) {
  const relation = relative(root, candidate);
  return relation === "" || (!relation.startsWith("..") && !isAbsolute(relation));
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeAtomic(path, contents, { flag = "w", mode = 0o644 } = {}) {
  // A create's final destination is opened with wx. A temporary file plus
  // rename is NOT no-replace: it can overwrite an editor's concurrent note.
  const temporary = flag === "wx" ? path : join(dirname(path), `.${path.split(/[\\/]/).pop()}.tmp-${randomUUID()}`);
  let handle;
  try {
    handle = await open(temporary, flag, mode);
    await handle.writeFile(contents, "utf8");
    await handle.sync();
    await handle.close();
    handle = null;
    if (temporary !== path) await rename(temporary, path);
    const directory = await open(dirname(path), "r").catch(() => null);
    await directory?.sync().catch(() => {});
    await directory?.close().catch(() => {});
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    if (temporary !== path) await unlink(temporary).catch(() => {});
    throw error;
  }
}

function validId(value) {
  return typeof value === "string" && /^[a-f0-9-]{20,80}$/i.test(value);
}

function normalizeBackup(value, undoId) {
  if (!value || value.version !== BACKUP_VERSION) return null;
  if (!["pending", "applied"].includes(value.status) || value.undoId !== undoId || !validId(undoId)) return null;
  if (value.operation !== "create" && value.operation !== "append") return null;
  if (typeof value.path !== "string" || typeof value.vaultPath !== "string") return null;
  if (typeof value.beforeContent !== "string" || typeof value.afterHash !== "string" || value.afterHash.length !== 40) return null;
  if (typeof value.beforeHash !== "string" || (value.beforeHash && value.beforeHash.length !== 40)) return null;
  return {
    undoId,
    proposalId: typeof value.proposalId === "string" ? value.proposalId : "",
    operation: value.operation,
    path: value.path,
    vaultPath: resolve(value.vaultPath),
    realVaultPath: resolve(value.realVaultPath || value.vaultPath),
    beforeContent: value.beforeContent,
    beforeHash: value.beforeHash,
    afterHash: value.afterHash,
    beforeExisted: value.beforeExisted !== false,
    createdAt: value.createdAt || "",
    status: value.status
  };
}

export class WriteManager {
  constructor({ vaultPath, realVaultPath, dataDir, persist }) {
    this.vaultPath = vaultPath ? resolve(vaultPath) : "";
    this.realVaultPath = realVaultPath ? resolve(realVaultPath) : this.vaultPath;
    this.dataDir = dataDir;
    this.persist = persist ?? (async () => {});
    this.proposals = new Map();
    this.undoRecords = new Map();
    this.backupsDir = join(dataDir, "backups");
    this.mutationTail = Promise.resolve();
    this.mutationsInFlight = new Set();
    this.ready = this.restoreBackups().catch((error) => {
      this.restoreError = error instanceof Error ? error.message : String(error);
      throw error;
    });
  }

  async restoreBackups() {
    let entries;
    try {
      entries = await readdir(this.backupsDir, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    const candidates = [];
    for (const entry of entries) {
      if (!entry.isFile() || !/^[a-f0-9-]{20,80}\.json$/i.test(entry.name)) continue;
      const path = join(this.backupsDir, entry.name);
      try {
        const record = normalizeBackup(JSON.parse(await readFile(path, "utf8")), entry.name.slice(0, -5));
        if (record) candidates.push(record);
      } catch {
        // A torn or invalid backup is not a user-approved mutation. Leave it
        // quarantined instead of allowing bad content into the write pipeline.
      }
    }
    candidates.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const record of candidates.slice(-MAX_RESTORED_BACKUPS)) this.undoRecords.set(record.undoId, record);
  }

  setVaultPath(vaultPath, realVaultPath) {
    this.vaultPath = vaultPath ? resolve(vaultPath) : "";
    this.realVaultPath = realVaultPath ? resolve(realVaultPath) : this.vaultPath;
  }

  enqueueMutation(mutator) {
    const operation = this.ready.then(() => {
      const result = this.mutationTail.then(mutator);
      this.mutationTail = result.catch(() => {});
      return result;
    });
    this.mutationsInFlight.add(operation);
    operation.finally(() => this.mutationsInFlight.delete(operation)).catch(() => {});
    return operation;
  }

  isCurrentVault(record) {
    return record.vaultPath === this.vaultPath && record.realVaultPath === this.realVaultPath;
  }

  backupPath(undoId) {
    return join(this.backupsDir, `${undoId}.json`);
  }

  async writeBackup(record, status) {
    await mkdir(this.backupsDir, { recursive: true, mode: 0o700 });
    await chmod(this.backupsDir, 0o700).catch(() => {});
    await writeAtomic(this.backupPath(record.undoId), JSON.stringify({
      version: BACKUP_VERSION,
      ...record,
      status
    }, null, 2), { mode: 0o600 });
  }

  async flush() {
    // Pending operations can enqueue behind an initialization barrier. Keep
    // taking a current snapshot until no new mutation chain is installed.
    let previous;
    do {
      previous = this.mutationTail;
      await Promise.all([...this.mutationsInFlight]);
    } while (previous !== this.mutationTail);
    await this.persist();
  }

  /** Resolve the nearest existing ancestor and keep the write inside the vault. */
  async assertSafeTarget(fullPath, fileExists) {
    const root = this.realVaultPath || this.vaultPath;
    let cursor = fileExists ? fullPath : dirname(fullPath);
    while (true) {
      try {
        const canonical = await realpath(cursor);
        if (!isInside(root, canonical)) throw new Error("Target path resolves outside the configured vault.");
        return;
      } catch (error) {
        if (error?.code !== "ENOENT" && error?.code !== "ENOTDIR") throw error;
        const parent = dirname(cursor);
        if (parent === cursor) throw new Error("Target path could not be resolved inside the vault.");
        cursor = parent;
      }
    }
  }

  async propose({ operation, targetPath, content, reason = "", citations = [] }) {
    await this.ready;
    if (!this.vaultPath) throw new Error("Configure a vault path before writing notes.");
    if (operation !== "create" && operation !== "append") throw new Error("Only create and append operations are supported.");
    if (typeof content !== "string" || !content.trim()) throw new Error("Write content must not be empty.");
    if (content.length > MAX_CONTENT) throw new Error(`Write content exceeds ${MAX_CONTENT} characters.`);
    const now = new Date();
    const safePath = targetPath
      ? normalizeVaultPath(targetPath)
      : `AI Inbox/${now.toISOString().slice(0, 10)} ${now.getTime().toString(36)}.md`;
    const fullPath = resolveInside(this.vaultPath, safePath);
    const hasFile = await exists(fullPath);
    if (operation === "create" && hasFile) throw new Error(`A note already exists at ${safePath}.`);
    if (operation === "append" && !hasFile) throw new Error(`No note exists at ${safePath}.`);
    await this.assertSafeTarget(fullPath, hasFile);
    const beforeContent = hasFile ? await readFile(fullPath, "utf8") : "";
    const proposalContent = operation === "create"
      ? content.replace(/\s*$/, "\n")
      : content.trim();
    const afterContent = operation === "create"
      ? proposalContent
      : `${beforeContent.replace(/\s*$/, "")}\n\n${content.trim()}\n`;
    const proposal = {
      id: randomUUID(), operation, path: safePath, fullPath, content, beforeContent, afterContent,
      beforeHash: hasFile ? sha1(beforeContent) : "", afterHash: sha1(afterContent),
      vaultPath: this.vaultPath, realVaultPath: this.realVaultPath,
      diff: buildDiff(beforeContent, proposalContent, operation), reason: String(reason ?? "").slice(0, 1000),
      citations: Array.isArray(citations) ? citations.map(String).slice(0, 20) : [],
      createdAt: new Date().toISOString(), status: "proposed"
    };
    this.proposals.set(proposal.id, proposal);
    return this.publicProposal(proposal);
  }

  publicProposal(proposal) {
    return {
      id: proposal.id, operation: proposal.operation, path: proposal.path, diff: proposal.diff,
      reason: proposal.reason, citations: proposal.citations, createdAt: proposal.createdAt, status: proposal.status
    };
  }

  async listProposals() {
    await this.ready;
    return [...this.proposals.values()]
      .filter((proposal) => proposal.status === "proposed")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((proposal) => this.publicProposal(proposal));
  }

  async proposalFor(id) {
    await this.ready;
    const proposal = this.proposals.get(String(id));
    return proposal ? this.publicProposal(proposal) : null;
  }

  async undoFor(id) {
    await this.ready;
    const record = this.undoRecords.get(String(id));
    return record && this.isCurrentVault(record)
      ? { undoId: record.undoId, path: record.path, operation: record.operation }
      : null;
  }

  async apply(proposalId) {
    const proposal = this.proposals.get(String(proposalId));
    if (!proposal) throw new Error("Write proposal was not found.");
    if (proposal.status !== "proposed") throw new Error("This write proposal has already been applied or is being applied.");
    // The current vault identity prevents reusing the id with stale on-disk
    // paths from the previous vault; the queue also serializes same-file appends.
    this.assertCurrentVault(proposal);
    proposal.status = "applying";
    return this.enqueueMutation(async () => {
      try {
        this.assertCurrentVault(proposal);
        await this.executeApply(proposal);
        proposal.status = "applied";
        return { undoId: proposal.undoId, path: proposal.path, operation: proposal.operation,
          bytesAdded: Buffer.byteLength(proposal.afterContent) - Buffer.byteLength(proposal.beforeContent) };
      } catch (error) {
        proposal.status = "proposed";
        throw error;
      }
    });
  }

  assertCurrentVault(record) {
    if (!this.vaultPath || !this.isCurrentVault(record)) throw new Error("This write belongs to a different vault. Return to the original vault before applying or undoing it.");
  }

  async executeApply(proposal) {
    if (proposal.undoId) {
      const recovered = this.undoRecords.get(proposal.undoId);
      if (recovered) {
        const fullPath = resolveInside(this.vaultPath, recovered.path);
        const current = await readFile(fullPath, "utf8");
        if (sha1(current) !== recovered.afterHash) throw new Error("The note changed after an interrupted write; refusing to apply it again.");
        if (recovered.status === "applied") return;
        await this.writeBackup(recovered, "applied");
        recovered.status = "applied";
        await this.persist();
        return;
      }
    }
    const currentExists = await exists(proposal.fullPath);
    await this.assertSafeTarget(proposal.fullPath, currentExists);
    const current = currentExists ? await readFile(proposal.fullPath, "utf8") : "";
    const currentHash = currentExists ? sha1(current) : "";
    if (proposal.operation === "append" && currentHash !== proposal.beforeHash) throw new Error("The note changed after this proposal was created. Create a new proposal.");
    if (proposal.operation === "create" && currentExists) throw new Error("The note was created after this proposal was made.");
    await mkdir(dirname(proposal.fullPath), { recursive: true });
    await this.assertSafeTarget(proposal.fullPath, currentExists);
    const record = {
      undoId: randomUUID(), proposalId: proposal.id, operation: proposal.operation, path: proposal.path,
      vaultPath: this.vaultPath, realVaultPath: this.realVaultPath, beforeContent: proposal.beforeContent,
      beforeHash: proposal.beforeHash, afterHash: proposal.afterHash, beforeExisted: currentExists,
      createdAt: new Date().toISOString(), status: "pending"
    };
    proposal.undoId = record.undoId;
    this.undoRecords.set(record.undoId, record);
    await this.writeBackup(record, "pending");
    try {
      const realFile = await realpath(proposal.fullPath).catch((error) => {
        if (error?.code === "ENOENT") return null;
        throw error;
      });
      if (realFile && !isInside(this.realVaultPath, realFile)) throw new Error("Target path resolves outside the configured vault.");
      if (proposal.operation === "append") {
        // The pending-backup write is intentionally an external-editor hook.
        // Validate the exact file again after it, not only before the I/O.
        const latest = await readFile(proposal.fullPath, "utf8");
        if (sha1(latest) !== proposal.beforeHash) throw new Error("The note changed after this proposal was created. Create a new proposal.");
      }
      await writeAtomic(proposal.fullPath, proposal.afterContent, {
        flag: proposal.operation === "create" ? "wx" : "w"
      });
    } catch (error) {
      await unlink(this.backupPath(record.undoId)).catch(() => {});
      this.undoRecords.delete(record.undoId);
      throw error;
    }
    await this.writeBackup(record, "applied");
    record.status = "applied";
    try {
      await this.persist();
    } catch (error) {
      // The durable backup remains authoritative. A syntax corruption in the
      // index must not silently discard the user's newly written note backup.
      await this.writeBackup(record, "pending").catch(() => {});
      record.status = "pending";
      throw error;
    }
  }

  async undo(undoId) {
    const record = this.undoRecords.get(String(undoId));
    if (!record) throw new Error("Undo record was not found for any applied write in this vault.");
    this.assertCurrentVault(record);
    return this.enqueueMutation(async () => {
      const currentRecord = this.undoRecords.get(String(undoId));
      if (!currentRecord) throw new Error("This write has already been undone.");
      this.assertCurrentVault(currentRecord);
      await this.executeUndo(currentRecord);
      await unlink(this.backupPath(currentRecord.undoId));
      this.undoRecords.delete(currentRecord.undoId);
      await this.persist();
      return { path: record.path, undone: true };
    });
  }

  async executeUndo(record) {
    if (record.status === "pending" && record.operation === "create") {
      const existsNow = await exists(resolveInside(this.vaultPath, record.path));
      if (!existsNow) return;
    }
    const fullPath = resolveInside(this.vaultPath, record.path);
    const current = await readFile(fullPath, "utf8").catch((error) => {
      if (error?.code === "ENOENT") throw new Error("The written note no longer exists.");
      throw error;
    });
    if (sha1(current) !== record.afterHash) {
      if (record.operation === "create" && record.status === "pending") throw new Error("The write was interrupted; the note does not match the backup, so it was left untouched.");
      throw new Error("The note changed after the write; refusing to undo.");
    }
    await this.assertSafeTarget(fullPath, true);
    const realFile = await realpath(fullPath);
    if (!isInside(this.realVaultPath, realFile)) throw new Error("Target path resolves outside the configured vault.");
    if (record.operation === "create") await unlink(fullPath);
    else await writeAtomic(fullPath, record.beforeContent);
  }
}
