import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const USAGE_VERSION = 1;
const DAY_MS = 86_400_000;
const KEEP_DAYS = 730;
const KEEP_MONTHS = 36;

function dayKey(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthKey(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function emptyUsage() {
  return {
    version: USAGE_VERSION,
    total: 0,
    byTool: {},
    daily: {},
    monthly: {},
    lastUsedAt: ""
  };
}

export class UsageStore {
  constructor({ dataDir }) {
    this.dataDir = dataDir;
    this.path = join(dataDir, "usage.json");
    this.data = emptyUsage();
    // A failed write must not poison the queue: later counters still retry
    // with a fresh snapshot, and record() propagates its own disk error.
    this.writeChain = Promise.resolve();
    this.pendingSnapshot = Promise.resolve();
    this.ready = this.load();
  }

  async load() {
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    try {
      const parsed = JSON.parse(await readFile(this.path, "utf8"));
      const counters = (group) => {
        const result = {};
        const source = group && typeof group === "object" && !Array.isArray(group) ? group : {};
        for (const [key, count] of Object.entries(source)) {
          if (key !== "__proto__" && key !== "constructor" && key !== "prototype" &&
            /^[0-9A-Za-z_.\/ -]{1,128}$/.test(key) && Number.isSafeInteger(count) && count >= 0) result[key] = count;
        }
        return result;
      };
      const byTool = counters(parsed?.byTool);
      this.data = {
        ...emptyUsage(),
        total: Number.isSafeInteger(parsed?.total) && parsed.total >= 0
          ? parsed.total : Object.values(byTool).reduce((sum, count) => sum + count, 0),
        byTool,
        daily: counters(parsed?.daily),
        monthly: counters(parsed?.monthly),
        lastUsedAt: typeof parsed?.lastUsedAt === "string" ? parsed.lastUsedAt : ""
      };
    } catch (error) {
      if (error?.code !== "ENOENT") this.data = emptyUsage();
    }
    return this;
  }

  prune(now = new Date()) {
    const oldestDay = dayKey(new Date(now.getTime() - KEEP_DAYS * DAY_MS));
    for (const key of Object.keys(this.data.daily)) if (key < oldestDay) delete this.data.daily[key];
    const oldestMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - KEEP_MONTHS + 1, 1));
    for (const key of Object.keys(this.data.monthly)) if (key < oldestMonth) delete this.data.monthly[key];
  }

  async record(tool, at = new Date()) {
    await this.ready;
    this.data.total += 1;
    this.data.byTool[tool] = (this.data.byTool[tool] ?? 0) + 1;
    const day = dayKey(at);
    const month = monthKey(at);
    this.data.daily[day] = (this.data.daily[day] ?? 0) + 1;
    this.data.monthly[month] = (this.data.monthly[month] ?? 0) + 1;
    this.data.lastUsedAt = at.toISOString();
    this.prune(at);
    this.writeChain = this.pendingSnapshot.then(() => this.save());
    this.pendingSnapshot = this.writeChain.catch(() => {});
    await this.writeChain;
    return this.summary();
  }

  async save() {
    const temporary = `${this.path}.tmp`;
    await writeFile(temporary, `${JSON.stringify(this.data, null, 2)}\n`, { mode: 0o600 });
    await rename(temporary, this.path);
  }

  summary(now = new Date()) {
    const daily = [];
    for (let offset = 13; offset >= 0; offset -= 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - offset);
      const key = dayKey(date);
      daily.push({ date: key, count: this.data.daily[key] ?? 0 });
    }
    const monthly = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = monthKey(date);
      monthly.push({ month: key, count: this.data.monthly[key] ?? 0 });
    }
    const today = dayKey(now);
    const month = monthKey(now);
    const last7 = daily.slice(-7).reduce((sum, day) => sum + day.count, 0);
    const last30Days = [];
    for (let offset = 29; offset >= 0; offset -= 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - offset);
      last30Days.push(this.data.daily[dayKey(date)] ?? 0);
    }
    const byTool = Object.entries(this.data.byTool)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    return {
      total: this.data.total,
      byTool,
      today: this.data.daily[today] ?? 0,
      month: this.data.monthly[month] ?? 0,
      last7,
      last30: last30Days.reduce((sum, count) => sum + count, 0),
      daily,
      monthly,
      lastUsedAt: this.data.lastUsedAt
    };
  }
}
